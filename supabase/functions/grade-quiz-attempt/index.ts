// supabase/functions/grade-quiz-attempt/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
// تأكد من أن المسار لملف الأنواع صحيح بالنسبة لموقع ملف الدالة
import type { Database, Tables, Json, Enums } from '../../../types/database.types.ts'; // Ajust path if necessary

// --- Types ---
type Option = Pick<Tables<'question_options'>, 'id' | 'question_id' | 'option_text' | 'is_correct'>; // Select needed fields
type QuestionWithOptions = Pick<Tables<'quiz_questions'>, 'id' | 'type' | 'points' | 'question_text'> & { // Select needed fields
  question_options: Option[];
};
type QuizAttempt = Tables<'quiz_attempts'>; // We might need more fields later
type Quiz = Pick<Tables<'quizzes'>, 'id' | 'pass_mark_percentage'>; // Select needed fields

// --- Helper: Get Correct TF Answer ---
function getCorrectAnswerTf(options: Option[] | null | undefined): boolean | null {
  const correctOption = options?.find(opt => opt.is_correct);
  if (!correctOption?.option_text) return null; // Return null if no correct option or text is empty
  // Consider more robust true/false check based on your actual option_text values
  return /^(true|1|صح|نعم)$/i.test(correctOption.option_text);
}

serve(async (req: Request) => {
  // --- CORS Preflight ---
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log("Grade function invoked..."); // Log invocation

  try {
    // --- Initialization ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Missing Supabase URL or Service Role Key environment variables.");
        throw new Error("Server configuration error."); // Don't expose details
    }

    // Use Service Role Key for backend functions to bypass RLS
    const supabaseAdminClient: SupabaseClient<Database> = createClient(supabaseUrl, serviceRoleKey);

    // --- Get Attempt ID from Webhook Payload ---
    const payload = await req.json();
    let attemptId: number | null = null;
    let triggerType: 'INSERT' | 'UPDATE' | 'MANUAL' | null = null; // Identify trigger source

    // Handle Database Webhook Payload (INSERT or UPDATE)
    if (payload.type && (payload.type === 'INSERT' || payload.type === 'UPDATE') && payload.record?.id) {
        triggerType = payload.type;
        attemptId = Number(payload.record.id); // Ensure it's a number
        console.log(`Webhook Trigger: Type=${triggerType}, Attempt ID=${attemptId}`);

        // --- Webhook Specific Checks ---
        // On INSERT: Grade only if 'submitted_at' is present
        if (triggerType === 'INSERT' && !payload.record.submitted_at) {
             console.log(`Attempt ${attemptId} inserted but not yet submitted. Skipping grading.`);
             return new Response(JSON.stringify({ message: 'Attempt not submitted yet.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        // On UPDATE: Grade only if 'submitted_at' changed from NULL to non-NULL
        if (triggerType === 'UPDATE') {
            const submittedNow = payload.record.submitted_at !== null;
            const submittedBefore = payload.old_record?.submitted_at !== null;
            if (!submittedNow || submittedBefore) {
                console.log(`Attempt ${attemptId} update did not involve submission or was already submitted. Skipping grading.`);
                return new Response(JSON.stringify({ message: 'No submission detected in update or already submitted.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
        }
         console.log(`Attempt ${attemptId} is ready for grading (via ${triggerType}).`);

    }
    // Handle Direct API call payload (optional, for manual triggering)
    else if (payload.attemptId) {
        triggerType = 'MANUAL';
        attemptId = Number(payload.attemptId); // Ensure it's a number
        console.log(`Manual Trigger: Attempt ID=${attemptId}`);
    }
    // Invalid Payload
    else {
        console.error("Invalid or missing attemptId in request payload:", payload);
        throw createError({ status: 400, message: "Attempt ID is required in the payload." });
    }

    // Validate extracted attemptId
    if (isNaN(attemptId) || attemptId <= 0) {
        throw createError({ status: 400, message: `Invalid Attempt ID provided: ${attemptId}` });
    }

    console.log(`[Grade Function] Processing attempt ID: ${attemptId}`);

    // --- Fetch Necessary Data using Admin Client ---
    // Fetch Attempt (use maybeSingle for better error handling)
    const { data: attempt, error: attemptError } = await supabaseAdminClient
      .from('quiz_attempts').select('*').eq('id', attemptId).maybeSingle(); // Use maybeSingle

    if (attemptError) {
        console.error(`Error fetching attempt ${attemptId}:`, attemptError);
        throw createError({ status: 500, message: `Database error fetching attempt: ${attemptError.message}` });
    }
    if (!attempt) {
        console.error(`Attempt ${attemptId} not found in database.`);
        throw createError({ status: 404, message: `Attempt ${attemptId} not found.` });
    }

    // --- Pre-Grading Checks on Fetched Attempt ---
    if (attempt.grading_status === 'graded' || attempt.grading_status === 'auto_graded') {
        console.warn(`Attempt ${attemptId} status is already '${attempt.grading_status}'. Skipping.`);
        return new Response(JSON.stringify({ message: `Attempt already graded (${attempt.grading_status}).` }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!attempt.submitted_at) {
         console.warn(`Attempt ${attemptId} is not submitted (submitted_at is null). Skipping grading.`);
         return new Response(JSON.stringify({ message: 'Attempt not submitted.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fetch Quiz (needed for pass mark)
    const { data: quiz, error: quizError } = await supabaseAdminClient
      .from('quizzes').select('id, pass_mark_percentage').eq('id', attempt.quiz_id).single(); // Can use single as attempt guarantees quiz exists
    if (quizError || !quiz) {
         console.error(`Error fetching quiz ${attempt.quiz_id}:`, quizError);
         throw createError({ status: 500, message: `Quiz not found or error fetching: ${quizError?.message || 'Not Found'}` });
     }

    // Fetch Questions with Options
    const { data: questions, error: questionsError } = await supabaseAdminClient
      .from('quiz_questions').select(`id, type, points, question_options ( id, question_id, option_text, is_correct )`).eq('quiz_id', quiz.id); // Fetch necessary fields
    if (questionsError || !questions) {
         console.error(`Error fetching questions for quiz ${quiz.id}:`, questionsError);
         throw createError({ status: 500, message: `Error fetching questions: ${questionsError?.message || 'Not Found'}` });
     }

    // --- Perform Grading ---
    console.log(`Grading ${questions.length} questions for attempt ${attemptId}...`);
    let autoScore = 0;
    let manualScoreRequired = false;
    let totalPossiblePoints = 0;
    const userAnswers = (attempt.answers && typeof attempt.answers === 'object' && !Array.isArray(attempt.answers))
                      ? attempt.answers as Record<string | number, any>
                      : {};

    for (const question of questions as QuestionWithOptions[]) { // Cast needed after select
      const questionId = question.id;
      const userAnswer = userAnswers[questionId]; // Get user's answer for this question
      const points = question.points ?? 0; // Default points to 0 if null
      totalPossiblePoints += points;

      console.log(`-> Grading Q${questionId} (Type: ${question.type}, Pts: ${points}) | User Answer:`, userAnswer);

      switch (question.type) {
        case 'mcq': {
          const correctOption = question.question_options?.find(opt => opt.is_correct);
          // Use Number() for comparison as answer might be stored as string/number
          if (correctOption && userAnswer !== null && userAnswer !== undefined && Number(userAnswer) === correctOption.id) {
            autoScore += points; console.log(`   Correct (+${points})`);
          } else { console.log(`   Incorrect (Correct: ${correctOption?.id})`); }
          break;
        }
        case 'true_false':
        case 'tf': {
          const correctAnswerBool = getCorrectAnswerTf(question.question_options);
          // Convert user answer robustly to boolean, considering string 'true'/'false'
          const userAnswerBool = typeof userAnswer === 'string' ? userAnswer.toLowerCase() === 'true' : Boolean(userAnswer);
          if (correctAnswerBool !== null && userAnswerBool === correctAnswerBool) {
            autoScore += points; console.log(`   Correct (+${points})`);
          } else { console.log(`   Incorrect (Correct: ${correctAnswerBool})`); }
          break;
        }
        case 'written':
          manualScoreRequired = true; console.log(`   Written - Manual grading needed.`);
          break;
        default:
          console.warn(`   Unknown Q type: ${question.type}. Assuming manual grading.`);
          manualScoreRequired = true; // Assume manual if type unknown
          break;
      }
    }

    // --- Determine Final Status & Scores ---
    const finalGradingStatus: Enums<'grading_status_enum'> = manualScoreRequired ? 'pending_manual' : 'auto_graded'; // Changed 'graded' to 'auto_graded'
    // Total score is initially just the auto score. Manual score will be added later if needed.
    const finalTotalScore = autoScore;
    let finalPassedStatus: boolean | null = null;
    const passMark = quiz.pass_mark_percentage ?? 50; // Default pass mark

    // Calculate pass/fail only if grading is fully automatic
    if (!manualScoreRequired) {
         if (totalPossiblePoints > 0) {
             finalPassedStatus = (finalTotalScore / totalPossiblePoints) * 100 >= passMark;
         } else {
             finalPassedStatus = true; // Or false, depending on business logic for 0-point quizzes
         }
    } // Otherwise, finalPassedStatus remains null

    console.log(`Grading Complete: AutoScore=${autoScore}, ManualNeeded=${manualScoreRequired}, TotalPossible=${totalPossiblePoints}, Passed=${finalPassedStatus}, Status=${finalGradingStatus}`);

    // --- Update Attempt Record ---
    const { error: updateError } = await supabaseAdminClient
      .from('quiz_attempts')
      .update({
        score: autoScore,
        total_score: finalTotalScore, // Update total score (might be only auto initially)
        passed: finalPassedStatus,    // Update pass status (might be null)
        grading_status: finalGradingStatus,
        // DO NOT update manual_score here. It's handled separately.
      })
      .eq('id', attemptId);

    if (updateError) {
      console.error(`Error updating attempt record ${attemptId}:`, updateError);
      throw createError({ status: 500, message: `Failed to update attempt record: ${updateError.message}` });
    }

    console.log(`Attempt ${attemptId} successfully graded and updated.`);

    // --- Return Success Response ---
    return new Response(JSON.stringify({
        message: `Attempt ${attemptId} processed. Status: ${finalGradingStatus}.`,
        attemptId: attemptId,
        status: finalGradingStatus,
        autoScore: autoScore,
        passed: finalPassedStatus
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Grade Function] Caught Error:', error);
    // Use the status code from createError if available
    const statusCode = error.statusCode || 500;
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred.' }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});