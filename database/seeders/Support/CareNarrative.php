<?php

namespace Database\Seeders\Support;

/**
 * Deterministic content pools for the demo dataset. Seeding the generator once
 * keeps every rebuild of the demo database identical.
 */
class CareNarrative
{
    public const BREAKFASTS = [
        'Weet-Bix with warm milk and half a banana. Ate independently.',
        'Two slices of raisin toast with margarine, plus a cup of tea.',
        'Porridge with honey. Needed prompting to finish the second half.',
        'Scrambled eggs on soft white toast. Good appetite this morning.',
        'Yoghurt and stewed apple. Preferred a smaller serve today.',
        'Cornflakes with milk. Left about a quarter of the bowl.',
        'Vegemite toast and orange juice. Ate the lot without prompting.',
    ];

    public const LUNCHES = [
        'Chicken and salad sandwich, cut into quarters. Ate all of it.',
        'Pumpkin soup with a bread roll. Soup thickened as per the plan.',
        'Tuna pasta salad and a mandarin. Ate about three quarters.',
        'Ham and cheese toastie with cucumber sticks. Enjoyed it.',
        'Shepherds pie leftovers with peas. Full serve finished.',
        'Egg sandwich and a small fruit cup. Slow but steady eating.',
        'Vegetable frittata with a side salad. Left the salad.',
    ];

    public const DINNERS = [
        'Roast chicken, mashed potato and steamed carrots. Ate well.',
        'Spaghetti bolognese with parmesan. Asked for a second small serve.',
        'Grilled barramundi, rice and beans. Ate most of the fish.',
        'Beef casserole with soft vegetables. Full serve finished.',
        'Butter chicken with rice, mild as per preference. Enjoyed it.',
        'Sausages, mashed potato and gravy. Left half the vegetables.',
        'Quiche with a garden salad. Small appetite this evening.',
    ];

    public const SNACKS = [
        'Cheese and crackers mid-afternoon.',
        'A banana and a milky coffee.',
        'Two Anzac biscuits with tea.',
        'Fruit salad and custard.',
        'Handful of dried apricots.',
        'Yoghurt tub before bed.',
        'Declined snacks today.',
    ];

    public const FLUID_NOTES = [
        'Encouraged fluids throughout the shift. Drinking independently.',
        'Needed regular prompting to drink. Cup left within reach.',
        'Used the weighted cup as per the therapy plan.',
        'Fluids taken well with meals, less so in between.',
        'Preferred cordial over plain water again today.',
    ];

    public const FOOD_NOTES = [
        'No swallowing difficulties observed.',
        'Ate independently with the built-up cutlery.',
        'Required light supervision at the table.',
        'Appetite noticeably better than earlier in the week.',
        'Small appetite. Offered extra snacks to compensate.',
        'All food cut to bite-sized pieces as per the mealtime plan.',
    ];

    public const PERSONAL_CARE_NOTES = [
        'Assisted with showering. Skin checked, no redness or marks found.',
        'Full assistance with personal care. Cooperative and relaxed throughout.',
        'Prompted through personal care with standby support only.',
        'Shower declined initially, offered again later and accepted.',
        'Hair washed and nails trimmed. Enjoyed the extra time.',
        'Assisted with oral care morning and evening.',
        'Continence aid changed twice. Skin integrity intact.',
    ];

    public const BOWEL_TEXTURES = [
        'Type 1 - hard lumps',
        'Type 2 - lumpy sausage',
        'Type 3 - cracked sausage',
        'Type 4 - smooth and soft',
        'Type 5 - soft blobs',
        'Type 6 - mushy',
        'Type 7 - watery',
    ];

    public const BOWEL_NOTES = [
        'Normal for this participant. No discomfort reported.',
        'No aperient required. Independent transfer to the bathroom.',
        'Small result. Will monitor over the next shift.',
        'Comfortable throughout. Fluids encouraged afterwards.',
        'Third day without a result. Flagged to the team leader.',
        'Assisted with hygiene afterwards. No skin concerns.',
    ];

    public const URINE_NOTES = [
        'Clear and pale. No odour.',
        'Slightly dark first thing, improved after fluids.',
        'Passing urine regularly, no discomfort reported.',
        'Strong odour noted. Increased fluids and will monitor.',
        'Not observed this shift as the participant is independent.',
    ];

    public const OVERNIGHT_OBSERVATIONS = [
        'Settled quickly and slept through without waking.',
        'Restless until around 1am, then slept soundly.',
        'Woke twice for the toilet, resettled without assistance.',
        'Called out once around 3am, reassured and went back to sleep.',
        'Slept well. Breathing quiet and regular at every check.',
        'Woke early and sat up reading until the morning shift.',
    ];

    public const OVERNIGHT_ATTENDANCE = [
        'Half hourly visual checks completed. No concerns.',
        'Two hourly repositioning as per the pressure care plan.',
        'Checked hourly. Blanket replaced twice.',
        'Assisted to the bathroom at 2:10am and 5:40am.',
        'Sensor mat in place and working. No alerts overnight.',
    ];

    public const HANDOVER_NOTES = [
        'Settled and comfortable for the whole shift. Nothing outstanding.',
        'Good day overall. Enjoyed the garden in the afternoon.',
        'Routine shift. Medications given on time and signed for.',
        'Bright and chatty. Family phoned in the evening.',
        'Quiet mood but no distress. Continue with the usual routine.',
        'Attended the community group and came back in good spirits.',
        'No changes to report. Fluids and meals as documented above.',
    ];

    public const FOLLOW_UP_NOTES = [
        'Third day without a bowel result. Please review with the team leader and consider the bowel chart.',
        'Refused both lunch and dinner. Appetite needs monitoring on the next shift.',
        'Small graze noticed on the left shin during personal care. Photographed and an incident report started.',
        'Appeared unsteady walking to the dining room. Please supervise transfers closely.',
        'Complained of a headache twice this afternoon. Observations taken, please recheck next shift.',
        'Fluid intake well below target today. Please prioritise encouraging drinks.',
        'Became distressed at handover time. Debrief planned with the behaviour support practitioner.',
    ];

    public const SEIZURE_AWARENESS = [
        'Fully aware',
        'Partially aware',
        'Unaware of surroundings',
        'Unresponsive to voice',
        'Responded to name after a delay',
    ];

    public const SEIZURE_FACIAL = [
        'Blank stare',
        'Eyes rolled upward',
        'Eyelid fluttering',
        'Lip smacking',
        'Facial twitching on the left',
        'Grimacing',
    ];

    public const SEIZURE_BODY = [
        'Whole body stiffening',
        'Jerking of both arms',
        'Jerking of the left arm',
        'Jerking of the right leg',
        'Head turned to one side',
        'Body went limp',
    ];

    public const SEIZURE_AUTOMATIC = [
        'Picking at clothing',
        'Rubbing hands together',
        'Chewing motion',
        'Swallowing repeatedly',
        'Attempted to stand and wander',
    ];

    public const SEIZURE_SPEECH = [
        'No speech',
        'Slurred speech',
        'Repeating the same word',
        'Unintelligible sounds',
        'Speech returned slowly afterwards',
    ];

    public const SEIZURE_AFTER_EFFECTS = [
        'Drowsy',
        'Confused for several minutes',
        'Complained of a headache',
        'Slept for over an hour',
        'Sore muscles',
        'Returned to baseline quickly',
        'Tearful',
    ];

    public function __construct(int $seed = 20260821)
    {
        mt_srand($seed);
    }

    /**
     * @param  list<string>  $options
     */
    public function pick(array $options): string
    {
        return $options[mt_rand(0, count($options) - 1)];
    }

    /**
     * @param  list<string>  $options
     * @return list<string>
     */
    public function some(array $options, int $min = 1, int $max = 3): array
    {
        $shuffled = $options;

        for ($i = count($shuffled) - 1; $i > 0; $i--) {
            $j = mt_rand(0, $i);
            [$shuffled[$i], $shuffled[$j]] = [$shuffled[$j], $shuffled[$i]];
        }

        return array_slice($shuffled, 0, mt_rand($min, min($max, count($shuffled))));
    }

    public function chance(int $percent): bool
    {
        return mt_rand(1, 100) <= $percent;
    }

    public function between(int $min, int $max): int
    {
        return mt_rand($min, $max);
    }
}
