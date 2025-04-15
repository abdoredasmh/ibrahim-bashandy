// supabase/functions/grade-quiz-attempt/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
// تأكد من أن المسار لملف الأنواع صحيح بالنسبة لموقع ملف الدالة
import type { Database, Tables, Json, Enums } from '../../../types/database.types.ts';

// --- Types ---
type Option = Tables<'question_options'>;
type QuestionWithOptions = Tables<'quiz_questions'> & {
  question_options: Option[];
};
type QuizAttempt = Tables<'quiz_attempts'>;
type Quiz = Tables<'quizzes'>;

// --- Helper: Get Correct TF Answer ---
function getCorrectAnswerTf(options: Option[]): boolean | null {
  const correctOption = options?.find(opt => opt.is_correct);
  if (!correctOption) return null;
  return /^(true|1|صح|نعم)$/i.test(correctOption.option_text);
}

serve(async (req: Request) => {
  // --- CORS Preflight ---
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- Authorization & Supabase Client ---
    const supabaseClient: SupabaseClient<Database> = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // ! استخدم مفتاح الخدمة
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // --- Get Attempt ID from Webhook Payload or Body ---
    let attemptId: number | null = null;
    const payload = await req.json();

    if (payload.record && payload.record.id && payload.type && (payload.type === 'INSERT' || payload.type === 'UPDATE')) {
        console.log(`Webhook triggered: Type=${payload.type}, Attempt ID=${payload.record.id}`);
        attemptId = payload.record.id;
        // Grade only if submitted_at is newly set or was set on insert
        const submittedNow = payload.record.submitted_at !== null;
        const submittedBefore = payload.old_record?.submitted_at !== null; // Check only on UPDATE
        if(payload.type === 'INSERT' && !submittedNow) {
             console.warn(`Attempt ${attemptId} inserted but not submitted. Skipping.`);
             return new Response(JSON.stringify({ message: 'Attempt not submitted yet.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        if(payload.type === 'UPDATE' && submittedBefore) {
            console.warn(`Attempt ${attemptId} was already submitted. Skipping re-grading via webhook.`);
            return new Response(JSON.stringify({ message: 'Attempt already submitted.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
         console.log(`Attempt ${attemptId} requires grading (submitted).`);
    } else if (payload.attemptId) { // For direct API call (optional)
        console.log("Direct API call for attempt ID:", payload.attemptId);
        attemptId = payload.attemptId;
    } else {
        console.error("Missing attemptId in request payload:", payload);
        throw new Error("Attempt ID is required.");
    }

    if (attemptId === null || typeof attemptId !== 'number' || attemptId <= 0) {
        throw new Error(`Invalid Attempt ID provided: ${attemptId}`);
    }

    console.log(`[grade-quiz-attempt] Processing attempt ID: ${attemptId}`);

    // --- Fetch Necessary Data ---
    const { data: attempt, error: attemptError } = await supabaseClient
      .from('quiz_attempts').select('*').eq('id', attemptId).single();
    if (attemptError || !attempt) throw new Error(`Attempt not found or error fetching: ${attemptError?.message || 'Not Found'}`);

    // Avoid re-grading if already fully graded or currently being graded by another process (simple check)
    if (attempt.grading_status === 'graded' || attempt.grading_status === 'auto_graded') {
        console.warn(`Attempt ${attemptId} is already graded (${attempt.grading_status}). Skipping.`);
        return new Response(JSON.stringify({ message: `Attempt already graded (${attempt.grading_status}).` }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    // Optional: Add a check here if submitted_at is null, though webhook logic might handle this
    if (!attempt.submitted_at) {
         console.warn(`Attempt ${attemptId} is not submitted yet. Skipping.`);
         return new Response(JSON.stringify({ message: 'Attempt not submitted.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }


    const { data: quiz, error: quizError } = await supabaseClient
      .from('quizzes').select('*').eq('id', attempt.quiz_id).single();
    if (quizError || !quiz) throw new Error(`Quiz not found or error fetching: ${quizError?.message || 'Not Found'}`);

    const { data: questions, error: questionsError } = await supabaseClient
      .from('quiz_questions').select('*, question_options (*)').eq('quiz_id', quiz.id);
    if (questionsError || !questions) throw new Error(`Error fetching questions: ${questionsError?.message || 'Not Found'}`);

    // --- Perform Grading ---
    console.log(`Grading ${questions.length} questions...`);
    let autoScore = 0;
    let manualScoreRequired = false;
    let totalPossiblePoints = 0;
    // Ensure answers is an object, default to empty object if null/undefined/not object
    const userAnswers = (attempt.answers && typeof attempt.answers === 'object' && !Array.isArray(attempt.answers))
                      ? attempt.answers as Record<string | number, any>
                      : {};

    for (const question of questions as QuestionWithOptions[]) {
      const questionId = question.id;
      const userAnswer = userAnswers[questionId];
      const points = question.points ?? 0;
      totalPossiblePoints += points;

      console.log(`Grading Q${questionId} (Type: ${question.type}, Points: ${points}): User Answer =`, userAnswer);

      switch (question.type) {
        case 'mcq': {
          const correctOption = question.question_options?.find(opt => opt.is_correct);
          // Ensure userAnswer is compared as the same type as option.id (likely number)
          if (correctOption && Number(userAnswer) === correctOption.id) {
            console.log(`  -> MCQ Correct! +${points}`);
            autoScore += points;
          } else {
             console.log(`  -> MCQ Incorrect. Correct was: ${correctOption?.id}, User selected: ${userAnswer}`);
          }
          break;
        }
        case 'true_false':
        case 'tf': {
          const correctAnswerBool = getCorrectAnswerTf(question.question_options);
          const userAnswerBool = typeof userAnswer === 'string' ? /^(true|1|صح|نعم)$/i.test(userAnswer) : Boolean(userAnswer);
          if (correctAnswerBool !== null && userAnswerBool === correctAnswerBool) {
            console.log(`  -> TF Correct! +${points}`);
            autoScore += points;
          } else {
             console.log(`  -> TF Incorrect. Correct was: ${correctAnswerBool}, User answered: ${userAnswerBool}`);
          }
          break;
        }
        case 'written':
          console.log("  -> Written question found. Manual grading required.");
          manualScoreRequired = true;
          // لا نحسب درجة آلية للسؤال المقالي هنا
          break;
        // --- أضف هنا منطق التصحيح للأنواع الأخرى إذا قمت بتطبيقها ---
        // case 'multiple_response': { ... }
        // case 'matching': { ... }
        // case 'fill_blank': { ... }
        // case 'ordering': { ... }
        // case 'numeric': { ... }
        default:
          console.warn(`  -> Unknown question type: ${question.type}. Skipping auto-grading.`);
          // افترض أنها تحتاج يدوي إذا لم تكن تعرف النوع
          if (question.type !== 'mcq' && question.type !== 'tf' && question.type !== 'true_false') {
              manualScoreRequired = true;
          }
          break;
      }
    }

    // --- Determine Status & Pass/Fail ---
    // الحالة تعتمد على وجود أسئلة مقالية
    const gradingStatus: Enums<'grading_status_enum'> = manualScoreRequired ? 'pending_manual' : 'auto_graded';

    // النتيجة الإجمالية الأولية هي فقط الدرجة الآلية
    // سيتم تحديثها لاحقاً إذا كان هناك تصحيح يدوي
    const totalScore = autoScore;

    // حالة النجاح/الرسوب تحدد فقط إذا تم التصحيح بالكامل آلياً
    // إذا كان يحتاج لتصحيح يدوي، تبقى null حتى يكتمل
    let passed: boolean | null = null;
    const passMarkPercent = quiz.pass_mark_percentage ?? 50; // الافتراضي 50%
    if (!manualScoreRequired && totalPossiblePoints > 0) {
      passed = (totalScore / totalPossiblePoints) * 100 >= passMarkPercent;
    } else if (!manualScoreRequired && totalPossiblePoints === 0) {
       passed = true; // أو false، حسب منطق الاختبارات بدون نقاط
    }

    console.log(`Grading Complete: AutoScore=${autoScore}, ManualRequired=${manualScoreRequired}, TotalPossible=${totalPossiblePoints}, Passed=${passed}, Status=${gradingStatus}`);

    // --- Update Attempt Record ---
    const { error: updateError } = await supabaseClient
      .from('quiz_attempts')
      .update({
        score: autoScore,            // الدرجة الآلية
        total_score: totalScore,       // النتيجة الإجمالية المبدئية
        passed: passed,              // null إذا كان يحتاج يدوي
        grading_status: gradingStatus,
        // submitted_at لا نغيره هنا، تم تعيينه عند الإرسال
        // manual_score يبقى null
      })
      .eq('id', attemptId);

    if (updateError) {
      console.error("Error updating attempt record:", updateError);
      throw new Error(`Failed to update attempt record: ${updateError.message}`);
    }

    console.log(`Attempt ${attemptId} successfully graded and updated.`);

    // --- Return Success Response ---
    return new Response(JSON.stringify({
        message: `Attempt ${attemptId} graded successfully.`,
        status: gradingStatus, autoScore: autoScore, passed: passed
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in grade-quiz-attempt function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.status || 500, // Use error status code if available
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});