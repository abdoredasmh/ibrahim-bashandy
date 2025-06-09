// supabase/functions/grade-quiz-attempt/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
// Update path if your types file location differs
import type { Database, Tables, Json, Enums } from '../../../types/database.types.ts';

// --- Types ---
// Ensure these types match your UPDATED database.types.ts
type Option = Pick<Tables<'question_options'>, 'id' | 'question_id' | 'option_text' | 'is_correct'>;
type QuestionWithOptions = Pick<Tables<'quiz_questions'>, 'id' | 'type' | 'points' | 'question_text'> & {
  question_options: Option[];
};
// Make sure your QuizAttempt type includes the new _grading_in_progress column
type QuizAttempt = Tables<'quiz_attempts'> & {
    _grading_in_progress?: boolean; // Add this if not already in your types
};
type Quiz = Pick<Tables<'quizzes'>, 'id' | 'pass_mark_percentage'>;
type GradingStatusEnum = Enums<'grading_status_enum'>; // Use enum if defined in types

// --- Helper: Create Error ---
class HttpError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}
function createError(options: { status: number; message: string }): HttpError {
    return new HttpError(options.message, options.status);
}

// --- Helper: Get Correct TF Answer ---
function getCorrectAnswerTf(options: Option[] | null | undefined): boolean | null {
  const correctOption = options?.find(opt => opt.is_correct);
  if (!correctOption?.option_text) return null;
  return /^(true|1|صح|نعم)$/i.test(correctOption.option_text);
}

serve(async (req: Request) => {
  // --- CORS Preflight ---
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log("Grade function invoked...");

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase URL or Service Role Key environment variables.");
      // Don't throw here directly, let finally block handle cleanup if attemptId is set
      return new Response(JSON.stringify({ error: "Server configuration error." }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
  }
  const supabaseAdminClient: SupabaseClient<Database> = createClient(supabaseUrl, serviceRoleKey);

  let attemptId: number | null = null; // Initialize to null

  try {
    // --- Get Attempt ID ---
    const payload = await req.json();
    let triggerType: 'INSERT' | 'UPDATE' | 'MANUAL' | null = null;

    if (payload.type && (payload.type === 'INSERT' || payload.type === 'UPDATE') && payload.record?.id) {
        triggerType = payload.type;
        attemptId = Number(payload.record.id); // Set attemptId here
        console.log(`Webhook Trigger: Type=${triggerType}, Attempt ID=${attemptId}`);

        if (triggerType === 'INSERT' && !payload.record.submitted_at) {
             console.log(`Attempt ${attemptId} inserted but not yet submitted. Skipping grading.`);
             return new Response(JSON.stringify({ message: 'Attempt not submitted yet.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
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
    else if (payload.attemptId) {
        triggerType = 'MANUAL';
        attemptId = Number(payload.attemptId); // Set attemptId here
        console.log(`Manual Trigger: Attempt ID=${attemptId}`);
    }
    else {
        console.error("Invalid or missing attemptId in request payload:", payload);
        throw createError({ status: 400, message: "Attempt ID is required in the payload." });
    }

    if (isNaN(attemptId) || attemptId <= 0) {
        throw createError({ status: 400, message: `Invalid Attempt ID provided: ${attemptId}` });
    }

    console.log(`[Grade Function] Processing attempt ID: ${attemptId}`);

    // --- Set Grading Flag to TRUE ---
    console.log(`Setting _grading_in_progress to TRUE for attempt ${attemptId}`);
    const { error: setFlagError } = await supabaseAdminClient
      .from('quiz_attempts')
      .update({ _grading_in_progress: true })
      .eq('id', attemptId);

    if (setFlagError) {
        console.error(`Error setting _grading_in_progress to TRUE for attempt ${attemptId}:`, setFlagError);
        // Depending on your error handling strategy, you might throw or just log
        throw createError({ status: 500, message: `Failed to set grading flag: ${setFlagError.message}` });
    }

    // --- Fetch Necessary Data using Admin Client ---
    const { data: attempt, error: attemptError } = await supabaseAdminClient
      .from('quiz_attempts').select('*').eq('id', attemptId).maybeSingle();

    if (attemptError) {
        console.error(`Error fetching attempt ${attemptId}:`, attemptError);
        throw createError({ status: 500, message: `Database error fetching attempt: ${attemptError.message}` });
    }
    if (!attempt) {
        console.error(`Attempt ${attemptId} not found in database.`);
        throw createError({ status: 404, message: `Attempt ${attemptId} not found.` });
    }

    // --- Pre-Grading Checks ---
    if (attempt.grading_status === 'graded' || attempt.grading_status === 'auto_graded') {
        console.warn(`Attempt ${attemptId} status is already '${attempt.grading_status}'. Skipping auto-grading.`);
        return new Response(JSON.stringify({ message: `Attempt already processed (${attempt.grading_status}).` }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!attempt.submitted_at) {
         console.warn(`Attempt ${attemptId} is not submitted (submitted_at is null). Skipping grading.`);
         return new Response(JSON.stringify({ message: 'Attempt not submitted.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: quiz, error: quizError } = await supabaseAdminClient
      .from('quizzes').select('id, pass_mark_percentage').eq('id', attempt.quiz_id).single();
    if (quizError || !quiz) {
         console.error(`Error fetching quiz ${attempt.quiz_id}:`, quizError);
         throw createError({ status: 500, message: `Quiz not found or error fetching: ${quizError?.message || 'Not Found'}` });
     }

    const { data: questions, error: questionsError } = await supabaseAdminClient
      .from('quiz_questions').select(`id, type, points, question_text, question_options ( id, question_id, option_text, is_correct )`).eq('quiz_id', quiz.id);
    if (questionsError || !questions) {
         console.error(`Error fetching questions for quiz ${quiz.id}:`, questionsError);
         throw createError({ status: 500, message: `Error fetching questions: ${questionsError?.message || 'Not Found'}` });
     }

    // --- Perform Auto-Grading ---
    console.log(`Auto-Grading ${questions.length} questions for attempt ${attemptId}...`);
    let autoScore = 0;
    let manualScoreRequired = false;
    let totalPossiblePoints = 0;
    const userAnswers = (attempt.answers && typeof attempt.answers === 'object' && !Array.isArray(attempt.answers))
                      ? attempt.answers as Record<string | number, any>
                      : {};

    for (const question of questions as QuestionWithOptions[]) {
      const questionId = question.id;
      const userAnswer = userAnswers[questionId];
      const points = question.points ?? 0;
      totalPossiblePoints += points;
      console.log(`-> Grading Q${questionId} (Type: ${question.type}, Pts: ${points}) | User Answer:`, userAnswer);
      switch (question.type) {
        case 'mcq': {
          const correctOption = question.question_options?.find(opt => opt.is_correct);
          if (correctOption && userAnswer !== null && userAnswer !== undefined && String(userAnswer) === String(correctOption.id)) {
            autoScore += points; console.log(`   Correct (+${points})`);
          } else { console.log(`   Incorrect (Correct Option ID: ${correctOption?.id})`); }
          break;
        }
        case 'true_false': {
          const correctAnswerBool = getCorrectAnswerTf(question.question_options);
          const userAnswerBool = typeof userAnswer === 'string' ? userAnswer.toLowerCase() === 'true' : Boolean(userAnswer);
          if (correctAnswerBool !== null && userAnswerBool === correctAnswerBool) {
            autoScore += points; console.log(`   Correct (+${points})`);
          } else { console.log(`   Incorrect (Correct Answer: ${correctAnswerBool})`); }
          break;
        }
        case 'written':
          manualScoreRequired = true; console.log(`   Written - Manual grading needed.`);
          break;
        default:
          console.warn(`   Unknown Q type: ${question.type}. Assuming manual grading needed.`);
          manualScoreRequired = true;
          break;
      }
    }

    const finalGradingStatus: GradingStatusEnum = manualScoreRequired ? 'pending_manual' : 'auto_graded';
    let finalTotalScore: number | null = null;
    let finalPassedStatus: boolean | null = null;
    const passMark = quiz.pass_mark_percentage ?? 50;

    if (finalGradingStatus === 'auto_graded') {
         finalTotalScore = autoScore;
         if (totalPossiblePoints > 0) {
             finalPassedStatus = (finalTotalScore / totalPossiblePoints) * 100 >= passMark;
         } else {
             finalPassedStatus = true;
         }
    } else {
         finalTotalScore = null;
         finalPassedStatus = null;
    }
    console.log(`Auto-Grading Complete: AutoScore=${autoScore}, ManualNeeded=${manualScoreRequired}, TotalPossible=${totalPossiblePoints}, FinalCalculatedPassed=${finalPassedStatus}, Status=${finalGradingStatus}`);

    // --- Update Attempt Record ---
    const updatePayload: Partial<QuizAttempt> = { // Use QuizAttempt type for type safety
        score: autoScore,
        total_score: finalTotalScore,
        passed: finalPassedStatus,
        grading_status: finalGradingStatus,
        // _grading_in_progress will be set to false in the finally block
    };

    const { error: updateError } = await supabaseAdminClient
      .from('quiz_attempts')
      .update(updatePayload)
      .eq('id', attemptId);

    if (updateError) {
      console.error(`Error updating attempt record ${attemptId}:`, updateError);
      throw createError({ status: 500, message: `Failed to update attempt record: ${updateError.message}` });
    }

    console.log(`Attempt ${attemptId} successfully auto-graded and updated.`);

    return new Response(JSON.stringify({
        message: `Attempt ${attemptId} auto-processed. Status: ${finalGradingStatus}.`,
        attemptId: attemptId,
        status: finalGradingStatus,
        autoScore: autoScore,
        passed: finalPassedStatus
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Grade Function] Caught Error in main try block:', error);
    const statusCode = error instanceof HttpError ? error.statusCode : 500;
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred.' }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } finally {
    // This block will always execute, ensuring the flag is reset if attemptId was determined.
    if (attemptId && !isNaN(attemptId) && attemptId > 0) {
        console.log(`[Finally Block] Setting _grading_in_progress to FALSE for attempt ${attemptId}`);
        const { error: resetFlagError } = await supabaseAdminClient
          .from('quiz_attempts')
          .update({ _grading_in_progress: false })
          .eq('id', attemptId);

        if (resetFlagError) {
            console.error(`CRITICAL: Error resetting _grading_in_progress to FALSE for attempt ${attemptId} in finally block:`, resetFlagError.message);
            // Log this critical error, as it might prevent future trigger invocations for this attempt.
        }
    } else {
        console.log("[Finally Block] No valid attemptId, skipping flag reset.");
    }
  }
});