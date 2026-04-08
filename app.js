/* ===================================================
   FitBuddy - Exercise Planner & Calorie Tracker
   Main Application Logic
   =================================================== */

(function () {
  'use strict';

  // ============================================================
  // CONSTANTS & DATA
  // ============================================================

  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const MOTIVATIONAL_QUOTES = [
    "Every rep counts. Every step matters. You've got this!",
    "The only bad workout is the one that didn't happen.",
    "Strong is the new everything. Let's crush it today!",
    "You're one workout away from a better mood!",
    "Progress, not perfection. Keep showing up!",
    "Your body can do it. It's your mind you need to convince.",
    "Sweat today, smile tomorrow. Let's go!",
    "Consistency beats intensity. Show up for yourself!",
    "You don't have to be great to start, but you have to start to be great.",
    "No gym? No problem! Your body IS the gym!",
    "Push harder than yesterday if you want a different tomorrow.",
    "The best project you'll ever work on is YOU!",
    "Make yourself proud. One workout at a time.",
    "Excuses don't burn calories. Let's get moving!",
    "Be stronger than your strongest excuse!"
  ];

  // Calorie burn rates per minute based on ~155lb person
  // Adjusted by user weight during calculation
  const CALORIE_RATES = {
    walking_slow: 2.9,
    walking_moderate: 5.0,
    walking_brisk: 6.5,
    jogging: 7.5,
    running: 10.0,
    cycling: 6.5,
    bodyweight_light: 4.5,
    bodyweight_moderate: 6.0,
    bodyweight_intense: 8.5,
    yoga: 3.5,
    stretching: 2.5,
    dancing: 5.5,
    swimming: 7.0,
    jump_rope: 10.0,
    stairs: 7.5,
    custom: 0
  };

  // Quick-add food items
  const COMMON_FOODS = [
    { name: 'Egg (1 large)', icon: '\u{1F95A}', calories: 72, meal: 'breakfast' },
    { name: 'Toast w/ Butter', icon: '\u{1F35E}', calories: 130, meal: 'breakfast' },
    { name: 'Oatmeal', icon: '\u{1F35A}', calories: 160, meal: 'breakfast' },
    { name: 'Banana', icon: '\u{1F34C}', calories: 105, meal: 'snack' },
    { name: 'Apple', icon: '\u{1F34E}', calories: 95, meal: 'snack' },
    { name: 'Chicken Breast', icon: '\u{1F357}', calories: 280, meal: 'lunch' },
    { name: 'Salad (side)', icon: '\u{1F957}', calories: 120, meal: 'lunch' },
    { name: 'Rice (1 cup)', icon: '\u{1F35A}', calories: 205, meal: 'dinner' },
    { name: 'Sandwich', icon: '\u{1F96A}', calories: 350, meal: 'lunch' },
    { name: 'Pasta (1 cup)', icon: '\u{1F35D}', calories: 220, meal: 'dinner' },
    { name: 'Yogurt', icon: '\u{1F95B}', calories: 150, meal: 'snack' },
    { name: 'Protein Bar', icon: '\u{1F36B}', calories: 200, meal: 'snack' },
    { name: 'Coffee w/ Cream', icon: '\u{2615}', calories: 50, meal: 'breakfast' },
    { name: 'Orange Juice', icon: '\u{1F34A}', calories: 110, meal: 'breakfast' },
    { name: 'Salmon Fillet', icon: '\u{1F41F}', calories: 350, meal: 'dinner' },
    { name: 'Mixed Nuts (1oz)', icon: '\u{1F95C}', calories: 170, meal: 'snack' },
    { name: 'Broccoli (1 cup)', icon: '\u{1F966}', calories: 55, meal: 'dinner' },
    { name: 'Sweet Potato', icon: '\u{1F360}', calories: 115, meal: 'dinner' }
  ];

  // Quick-add exercises
  const COMMON_EXERCISES = [
    { name: 'Walk (30 min)', icon: '\u{1F6B6}', type: 'walking_moderate', duration: 30 },
    { name: 'Walk (60 min)', icon: '\u{1F6B6}', type: 'walking_moderate', duration: 60 },
    { name: 'Jog (30 min)', icon: '\u{1F3C3}', type: 'jogging', duration: 30 },
    { name: 'HIIT (20 min)', icon: '\u{26A1}', type: 'bodyweight_intense', duration: 20 },
    { name: 'Yoga (30 min)', icon: '\u{1F9D8}', type: 'yoga', duration: 30 },
    { name: 'Stretch (15 min)', icon: '\u{1F938}', type: 'stretching', duration: 15 }
  ];

  // ============================================================
  // EXERCISE DATABASE - Bodyweight, No Equipment
  // ============================================================

  const EXERCISES = {
    // Upper body
    pushups: {
      name: 'Push-Ups', target: 'Chest, Shoulders, Triceps',
      beginner: '8-10 reps', intermediate: '15-20 reps', advanced: '25-30 reps',
      instructions: 'Hands shoulder-width apart, lower chest to floor, push back up.'
    },
    knee_pushups: {
      name: 'Knee Push-Ups', target: 'Chest, Shoulders, Triceps',
      beginner: '10-12 reps', intermediate: '15-20 reps', advanced: '25 reps',
      instructions: 'Modified push-up from knees. Great for building up to full push-ups.'
    },
    wide_pushups: {
      name: 'Wide Push-Ups', target: 'Chest, Shoulders',
      beginner: '6-8 reps', intermediate: '12-15 reps', advanced: '20-25 reps',
      instructions: 'Hands wider than shoulder-width. Targets outer chest more.'
    },
    diamond_pushups: {
      name: 'Diamond Push-Ups', target: 'Triceps, Chest',
      beginner: '5-8 reps', intermediate: '10-15 reps', advanced: '20 reps',
      instructions: 'Hands close together forming a diamond shape under chest.'
    },
    tricep_dips: {
      name: 'Tricep Dips (Chair)', target: 'Triceps, Shoulders',
      beginner: '8-10 reps', intermediate: '15-20 reps', advanced: '25 reps',
      instructions: 'Use a sturdy chair. Lower body by bending elbows, push back up.'
    },
    plank: {
      name: 'Plank Hold', target: 'Core, Shoulders',
      beginner: '20-30 sec', intermediate: '45-60 sec', advanced: '60-90 sec',
      instructions: 'Forearms on floor, body straight like a board. Hold position.'
    },
    side_plank: {
      name: 'Side Plank', target: 'Obliques, Core',
      beginner: '15-20 sec/side', intermediate: '30-45 sec/side', advanced: '60 sec/side',
      instructions: 'On one forearm, stack feet, lift hips. Hold each side.'
    },
    superman: {
      name: 'Superman Hold', target: 'Lower Back, Glutes',
      beginner: '15-20 sec', intermediate: '30-45 sec', advanced: '45-60 sec',
      instructions: 'Lie face down, lift arms and legs off floor simultaneously.'
    },
    shoulder_taps: {
      name: 'Shoulder Taps', target: 'Core, Shoulders',
      beginner: '10 total', intermediate: '20 total', advanced: '30 total',
      instructions: 'In push-up position, tap opposite shoulder with each hand.'
    },
    // Lower body
    squats: {
      name: 'Bodyweight Squats', target: 'Quads, Glutes, Hamstrings',
      beginner: '10-12 reps', intermediate: '20-25 reps', advanced: '30 reps',
      instructions: 'Feet shoulder-width, lower as if sitting in a chair, stand back up.'
    },
    jump_squats: {
      name: 'Jump Squats', target: 'Quads, Glutes, Calves',
      beginner: '6-8 reps', intermediate: '12-15 reps', advanced: '20 reps',
      instructions: 'Squat down then explode upward into a jump. Land softly.'
    },
    lunges: {
      name: 'Forward Lunges', target: 'Quads, Glutes, Hamstrings',
      beginner: '8 each leg', intermediate: '12 each leg', advanced: '16 each leg',
      instructions: 'Step forward, lower back knee toward floor, push back to start.'
    },
    reverse_lunges: {
      name: 'Reverse Lunges', target: 'Quads, Glutes',
      beginner: '8 each leg', intermediate: '12 each leg', advanced: '16 each leg',
      instructions: 'Step backward into a lunge. Easier on knees than forward lunges.'
    },
    side_lunges: {
      name: 'Side Lunges', target: 'Inner Thighs, Glutes, Quads',
      beginner: '8 each side', intermediate: '12 each side', advanced: '16 each side',
      instructions: 'Step wide to one side, bend that knee, push back to center.'
    },
    glute_bridges: {
      name: 'Glute Bridges', target: 'Glutes, Hamstrings',
      beginner: '12-15 reps', intermediate: '20-25 reps', advanced: '30 reps',
      instructions: 'Lie on back, knees bent, push hips toward ceiling, squeeze glutes.'
    },
    calf_raises: {
      name: 'Calf Raises', target: 'Calves',
      beginner: '15 reps', intermediate: '25 reps', advanced: '35 reps',
      instructions: 'Stand tall, rise up on toes, lower back down slowly.'
    },
    wall_sit: {
      name: 'Wall Sit', target: 'Quads, Glutes',
      beginner: '20-30 sec', intermediate: '45-60 sec', advanced: '60-90 sec',
      instructions: 'Back against wall, slide down until thighs are parallel to floor. Hold.'
    },
    sumo_squats: {
      name: 'Sumo Squats', target: 'Inner Thighs, Glutes, Quads',
      beginner: '10-12 reps', intermediate: '18-20 reps', advanced: '25 reps',
      instructions: 'Wide stance, toes out, squat down keeping torso upright.'
    },
    single_leg_glute_bridge: {
      name: 'Single-Leg Glute Bridge', target: 'Glutes, Hamstrings',
      beginner: '8 each leg', intermediate: '12 each leg', advanced: '16 each leg',
      instructions: 'Like a glute bridge but with one leg extended. Alternate legs.'
    },
    // Cardio / Full body
    burpees: {
      name: 'Burpees', target: 'Full Body',
      beginner: '5-6 reps', intermediate: '10-12 reps', advanced: '15-20 reps',
      instructions: 'Squat, jump feet back to plank, push-up, jump feet forward, jump up.'
    },
    mountain_climbers: {
      name: 'Mountain Climbers', target: 'Core, Cardio',
      beginner: '10 each leg', intermediate: '20 each leg', advanced: '30 each leg',
      instructions: 'In plank position, drive knees toward chest alternately, quickly.'
    },
    high_knees: {
      name: 'High Knees', target: 'Cardio, Core',
      beginner: '20 sec', intermediate: '30 sec', advanced: '45 sec',
      instructions: 'Jog in place, driving knees up high. Pump arms for momentum.'
    },
    jumping_jacks: {
      name: 'Jumping Jacks', target: 'Cardio, Full Body',
      beginner: '20 reps', intermediate: '35 reps', advanced: '50 reps',
      instructions: 'Jump feet out while raising arms overhead, jump back to start.'
    },
    bicycle_crunches: {
      name: 'Bicycle Crunches', target: 'Core, Obliques',
      beginner: '10 each side', intermediate: '20 each side', advanced: '30 each side',
      instructions: 'Lie on back, alternate bringing elbow to opposite knee.'
    },
    star_jumps: {
      name: 'Star Jumps', target: 'Full Body, Cardio',
      beginner: '8 reps', intermediate: '15 reps', advanced: '20 reps',
      instructions: 'Squat down, then jump spreading arms and legs wide like a star.'
    },
    march_in_place: {
      name: 'March in Place', target: 'Warm-Up, Cardio',
      beginner: '60 sec', intermediate: '60 sec', advanced: '60 sec',
      instructions: 'March with high knees at moderate pace. Great warm-up!'
    },
    arm_circles: {
      name: 'Arm Circles', target: 'Warm-Up, Shoulders',
      beginner: '30 sec each direction', intermediate: '30 sec each direction',
      advanced: '30 sec each direction',
      instructions: 'Extend arms to sides, make small circles. Switch direction.'
    },
    leg_swings: {
      name: 'Leg Swings', target: 'Warm-Up, Hips',
      beginner: '10 each leg', intermediate: '10 each leg', advanced: '10 each leg',
      instructions: 'Hold support, swing leg forward and back, then side to side.'
    },
    hip_circles: {
      name: 'Hip Circles', target: 'Warm-Up, Hips',
      beginner: '10 each direction', intermediate: '10 each direction',
      advanced: '10 each direction',
      instructions: 'Hands on hips, make large circles. Switch direction.'
    }
  };

  // Workout plan templates
  const WORKOUT_PLANS = {
    beginner: [
      {
        name: 'Upper Body Basics',
        type: 'upper',
        estimatedCalories: 280,
        phases: [
          {
            name: 'Warm-Up',
            duration: '5 min',
            exercises: [
              { id: 'march_in_place', duration: '2 min' },
              { id: 'arm_circles', duration: '1 min' },
              { id: 'hip_circles', duration: '1 min' },
              { id: 'leg_swings', duration: '1 min' }
            ]
          },
          {
            name: 'Circuit 1 (x3 rounds, 40s work / 20s rest)',
            duration: '18 min',
            exercises: [
              { id: 'knee_pushups', duration: '40 sec' },
              { id: 'plank', duration: '40 sec' },
              { id: 'tricep_dips', duration: '40 sec' },
              { id: 'shoulder_taps', duration: '40 sec' }
            ]
          },
          {
            name: 'Circuit 2 (x3 rounds, 40s work / 20s rest)',
            duration: '18 min',
            exercises: [
              { id: 'pushups', duration: '40 sec' },
              { id: 'superman', duration: '40 sec' },
              { id: 'mountain_climbers', duration: '40 sec' },
              { id: 'side_plank', duration: '20 sec each side' }
            ]
          },
          {
            name: 'Cool-Down Stretch',
            duration: '10 min',
            exercises: [
              { id: 'arm_circles', duration: 'Gentle, 1 min' },
              { id: 'hip_circles', duration: 'Slow, 1 min' }
            ]
          }
        ]
      },
      {
        name: 'Lower Body Builder',
        type: 'lower',
        estimatedCalories: 300,
        phases: [
          {
            name: 'Warm-Up',
            duration: '5 min',
            exercises: [
              { id: 'march_in_place', duration: '2 min' },
              { id: 'leg_swings', duration: '1.5 min' },
              { id: 'hip_circles', duration: '1.5 min' }
            ]
          },
          {
            name: 'Circuit 1 (x3 rounds, 40s work / 20s rest)',
            duration: '18 min',
            exercises: [
              { id: 'squats', duration: '40 sec' },
              { id: 'lunges', duration: '40 sec' },
              { id: 'glute_bridges', duration: '40 sec' },
              { id: 'calf_raises', duration: '40 sec' }
            ]
          },
          {
            name: 'Circuit 2 (x3 rounds, 40s work / 20s rest)',
            duration: '18 min',
            exercises: [
              { id: 'sumo_squats', duration: '40 sec' },
              { id: 'reverse_lunges', duration: '40 sec' },
              { id: 'wall_sit', duration: '30 sec' },
              { id: 'side_lunges', duration: '40 sec' }
            ]
          },
          {
            name: 'Cool-Down Stretch',
            duration: '10 min',
            exercises: [
              { id: 'leg_swings', duration: 'Gentle, 2 min' },
              { id: 'hip_circles', duration: 'Slow, 2 min' }
            ]
          }
        ]
      },
      {
        name: 'Full Body Burn',
        type: 'full',
        estimatedCalories: 350,
        phases: [
          {
            name: 'Warm-Up',
            duration: '5 min',
            exercises: [
              { id: 'march_in_place', duration: '2 min' },
              { id: 'arm_circles', duration: '1 min' },
              { id: 'leg_swings', duration: '1 min' },
              { id: 'jumping_jacks', duration: '1 min (easy pace)' }
            ]
          },
          {
            name: 'Circuit 1 (x3 rounds, 40s work / 20s rest)',
            duration: '18 min',
            exercises: [
              { id: 'squats', duration: '40 sec' },
              { id: 'pushups', duration: '40 sec' },
              { id: 'high_knees', duration: '40 sec' },
              { id: 'plank', duration: '40 sec' }
            ]
          },
          {
            name: 'Circuit 2 (x3 rounds, 40s work / 20s rest)',
            duration: '18 min',
            exercises: [
              { id: 'lunges', duration: '40 sec' },
              { id: 'tricep_dips', duration: '40 sec' },
              { id: 'mountain_climbers', duration: '40 sec' },
              { id: 'bicycle_crunches', duration: '40 sec' }
            ]
          },
          {
            name: 'Cool-Down Stretch',
            duration: '10 min',
            exercises: [
              { id: 'arm_circles', duration: 'Slow, 1 min' },
              { id: 'leg_swings', duration: 'Gentle, 2 min' }
            ]
          }
        ]
      }
    ],
    intermediate: [
      {
        name: 'Upper Body Power',
        type: 'upper',
        estimatedCalories: 380,
        phases: [
          {
            name: 'Warm-Up',
            duration: '5 min',
            exercises: [
              { id: 'jumping_jacks', duration: '2 min' },
              { id: 'arm_circles', duration: '1.5 min' },
              { id: 'march_in_place', duration: '1.5 min' }
            ]
          },
          {
            name: 'Circuit 1 (x4 rounds, 40s work / 15s rest)',
            duration: '20 min',
            exercises: [
              { id: 'pushups', duration: '40 sec' },
              { id: 'diamond_pushups', duration: '40 sec' },
              { id: 'plank', duration: '45 sec' },
              { id: 'mountain_climbers', duration: '40 sec' }
            ]
          },
          {
            name: 'Circuit 2 (x4 rounds, 40s work / 15s rest)',
            duration: '20 min',
            exercises: [
              { id: 'wide_pushups', duration: '40 sec' },
              { id: 'tricep_dips', duration: '40 sec' },
              { id: 'superman', duration: '40 sec' },
              { id: 'shoulder_taps', duration: '40 sec' }
            ]
          },
          {
            name: 'Burnout + Cool-Down',
            duration: '10 min',
            exercises: [
              { id: 'side_plank', duration: '30 sec each side' },
              { id: 'arm_circles', duration: 'Cool-down, 2 min' }
            ]
          }
        ]
      },
      {
        name: 'Lower Body Sculpt',
        type: 'lower',
        estimatedCalories: 400,
        phases: [
          {
            name: 'Warm-Up',
            duration: '5 min',
            exercises: [
              { id: 'jumping_jacks', duration: '2 min' },
              { id: 'leg_swings', duration: '1.5 min' },
              { id: 'hip_circles', duration: '1.5 min' }
            ]
          },
          {
            name: 'Circuit 1 (x4 rounds, 40s work / 15s rest)',
            duration: '20 min',
            exercises: [
              { id: 'squats', duration: '40 sec' },
              { id: 'jump_squats', duration: '40 sec' },
              { id: 'lunges', duration: '40 sec' },
              { id: 'glute_bridges', duration: '40 sec' }
            ]
          },
          {
            name: 'Circuit 2 (x4 rounds, 40s work / 15s rest)',
            duration: '20 min',
            exercises: [
              { id: 'sumo_squats', duration: '40 sec' },
              { id: 'reverse_lunges', duration: '40 sec' },
              { id: 'single_leg_glute_bridge', duration: '20 sec each leg' },
              { id: 'wall_sit', duration: '45 sec' }
            ]
          },
          {
            name: 'Burnout + Cool-Down',
            duration: '10 min',
            exercises: [
              { id: 'calf_raises', duration: '25 reps' },
              { id: 'leg_swings', duration: 'Cool-down, 2 min' }
            ]
          }
        ]
      },
      {
        name: 'Full Body HIIT',
        type: 'full',
        estimatedCalories: 450,
        phases: [
          {
            name: 'Warm-Up',
            duration: '5 min',
            exercises: [
              { id: 'jumping_jacks', duration: '2 min' },
              { id: 'arm_circles', duration: '1 min' },
              { id: 'leg_swings', duration: '1 min' },
              { id: 'high_knees', duration: '1 min (easy)' }
            ]
          },
          {
            name: 'Circuit 1 (x4 rounds, 45s work / 15s rest)',
            duration: '20 min',
            exercises: [
              { id: 'burpees', duration: '45 sec' },
              { id: 'pushups', duration: '45 sec' },
              { id: 'jump_squats', duration: '45 sec' },
              { id: 'plank', duration: '45 sec' }
            ]
          },
          {
            name: 'Circuit 2 (x4 rounds, 45s work / 15s rest)',
            duration: '20 min',
            exercises: [
              { id: 'mountain_climbers', duration: '45 sec' },
              { id: 'lunges', duration: '45 sec' },
              { id: 'diamond_pushups', duration: '45 sec' },
              { id: 'bicycle_crunches', duration: '45 sec' }
            ]
          },
          {
            name: 'Cool-Down',
            duration: '10 min',
            exercises: [
              { id: 'march_in_place', duration: 'Slow pace, 2 min' },
              { id: 'hip_circles', duration: 'Gentle, 2 min' }
            ]
          }
        ]
      }
    ],
    advanced: [
      {
        name: 'Upper Body Blitz',
        type: 'upper',
        estimatedCalories: 480,
        phases: [
          {
            name: 'Warm-Up',
            duration: '5 min',
            exercises: [
              { id: 'jumping_jacks', duration: '2 min' },
              { id: 'arm_circles', duration: '1 min' },
              { id: 'mountain_climbers', duration: '2 min (easy)' }
            ]
          },
          {
            name: 'Circuit 1 (x5 rounds, 45s work / 10s rest)',
            duration: '22 min',
            exercises: [
              { id: 'pushups', duration: '45 sec' },
              { id: 'diamond_pushups', duration: '45 sec' },
              { id: 'wide_pushups', duration: '45 sec' },
              { id: 'shoulder_taps', duration: '45 sec' }
            ]
          },
          {
            name: 'Circuit 2 (x5 rounds, 45s work / 10s rest)',
            duration: '22 min',
            exercises: [
              { id: 'tricep_dips', duration: '45 sec' },
              { id: 'superman', duration: '45 sec' },
              { id: 'plank', duration: '60 sec' },
              { id: 'burpees', duration: '45 sec' }
            ]
          },
          {
            name: 'Cool-Down',
            duration: '8 min',
            exercises: [
              { id: 'arm_circles', duration: 'Slow, 2 min' },
              { id: 'side_plank', duration: '45 sec each side' }
            ]
          }
        ]
      },
      {
        name: 'Lower Body Destroyer',
        type: 'lower',
        estimatedCalories: 500,
        phases: [
          {
            name: 'Warm-Up',
            duration: '5 min',
            exercises: [
              { id: 'high_knees', duration: '2 min' },
              { id: 'leg_swings', duration: '1.5 min' },
              { id: 'hip_circles', duration: '1.5 min' }
            ]
          },
          {
            name: 'Circuit 1 (x5 rounds, 45s work / 10s rest)',
            duration: '22 min',
            exercises: [
              { id: 'jump_squats', duration: '45 sec' },
              { id: 'lunges', duration: '45 sec' },
              { id: 'sumo_squats', duration: '45 sec' },
              { id: 'single_leg_glute_bridge', duration: '20 sec each leg' }
            ]
          },
          {
            name: 'Circuit 2 (x5 rounds, 45s work / 10s rest)',
            duration: '22 min',
            exercises: [
              { id: 'star_jumps', duration: '45 sec' },
              { id: 'reverse_lunges', duration: '45 sec' },
              { id: 'wall_sit', duration: '60 sec' },
              { id: 'side_lunges', duration: '45 sec' }
            ]
          },
          {
            name: 'Cool-Down',
            duration: '8 min',
            exercises: [
              { id: 'leg_swings', duration: 'Gentle, 2 min' },
              { id: 'march_in_place', duration: 'Slow, 2 min' }
            ]
          }
        ]
      },
      {
        name: 'Full Body Inferno',
        type: 'full',
        estimatedCalories: 550,
        phases: [
          {
            name: 'Warm-Up',
            duration: '5 min',
            exercises: [
              { id: 'jumping_jacks', duration: '2 min' },
              { id: 'arm_circles', duration: '1 min' },
              { id: 'high_knees', duration: '2 min' }
            ]
          },
          {
            name: 'Circuit 1 (x5 rounds, 45s work / 10s rest)',
            duration: '22 min',
            exercises: [
              { id: 'burpees', duration: '45 sec' },
              { id: 'pushups', duration: '45 sec' },
              { id: 'jump_squats', duration: '45 sec' },
              { id: 'mountain_climbers', duration: '45 sec' }
            ]
          },
          {
            name: 'Circuit 2 (x5 rounds, 45s work / 10s rest)',
            duration: '22 min',
            exercises: [
              { id: 'star_jumps', duration: '45 sec' },
              { id: 'diamond_pushups', duration: '45 sec' },
              { id: 'lunges', duration: '45 sec' },
              { id: 'bicycle_crunches', duration: '45 sec' }
            ]
          },
          {
            name: 'Cool-Down',
            duration: '8 min',
            exercises: [
              { id: 'march_in_place', duration: 'Slow, 3 min' },
              { id: 'hip_circles', duration: 'Gentle, 2 min' }
            ]
          }
        ]
      }
    ]
  };

  // Badge definitions
  const BADGES = [
    {
      id: 'first_step',
      name: 'First Step',
      icon: '\u{1F31F}',
      description: 'Complete your first workout',
      check: (s) => s.totalWorkouts >= 1
    },
    {
      id: 'on_fire',
      name: 'On Fire',
      icon: '\u{1F525}',
      description: 'Complete 3 workouts in a week',
      check: (s) => s.workoutsThisWeek >= 3
    },
    {
      id: 'week_warrior',
      name: 'Week Warrior',
      icon: '\u{1F4AA}',
      description: 'Hit a 1-week streak',
      check: (s) => s.weekStreak >= 1
    },
    {
      id: 'gold_star',
      name: 'Gold Star',
      icon: '\u{2B50}',
      description: 'Maintain a 2-week streak',
      check: (s) => s.weekStreak >= 2
    },
    {
      id: 'champion',
      name: 'Champion',
      icon: '\u{1F3C6}',
      description: 'Maintain a 4-week streak',
      check: (s) => s.weekStreak >= 4
    },
    {
      id: 'diamond',
      name: 'Diamond',
      icon: '\u{1F48E}',
      description: 'Maintain an 8-week streak',
      check: (s) => s.weekStreak >= 8
    },
    {
      id: 'royalty',
      name: 'Royalty',
      icon: '\u{1F451}',
      description: 'Maintain a 12-week streak',
      check: (s) => s.weekStreak >= 12
    },
    {
      id: 'calorie_crusher',
      name: 'Calorie Crusher',
      icon: '\u{1F3AF}',
      description: 'Log calories for 7 days straight',
      check: (s) => s.calorieLogStreak >= 7
    },
    {
      id: 'tracker_pro',
      name: 'Tracker Pro',
      icon: '\u{1F4CA}',
      description: 'Log calories for 14 consecutive days',
      check: (s) => s.calorieLogStreak >= 14
    },
    {
      id: 'ten_strong',
      name: 'Ten Strong',
      icon: '\u{1F4A5}',
      description: 'Complete 10 total workouts',
      check: (s) => s.totalWorkouts >= 10
    },
    {
      id: 'quarter_century',
      name: 'Quarter Century',
      icon: '\u{1F680}',
      description: 'Complete 25 total workouts',
      check: (s) => s.totalWorkouts >= 25
    },
    {
      id: 'half_century',
      name: 'Half Century',
      icon: '\u{1F4AB}',
      description: 'Complete 50 total workouts',
      check: (s) => s.totalWorkouts >= 50
    },
    {
      id: 'century',
      name: 'Century Club',
      icon: '\u{1F4AF}',
      description: 'Complete 100 total workouts',
      check: (s) => s.totalWorkouts >= 100
    },
    {
      id: 'burn_1k',
      name: '1K Burn',
      icon: '\u{1F525}',
      description: 'Burn 1,000 total exercise calories',
      check: (s) => s.totalCaloriesBurned >= 1000
    },
    {
      id: 'burn_10k',
      name: '10K Inferno',
      icon: '\u{2604}',
      description: 'Burn 10,000 total exercise calories',
      check: (s) => s.totalCaloriesBurned >= 10000
    }
  ];

  // ============================================================
  // STATE
  // ============================================================

  let state = {
    currentTab: 'dashboard',
    profile: {
      weight: 155,
      weightUnit: 'lbs',
      level: 'beginner',
      workoutDays: [],  // Array of 0-6 (Mon=0 through Sun=6)
      calorieGoal: 2000,
      setupComplete: false
    },
    // Workout completions: { 'YYYY-MM-DD': { workoutIndex, caloriesBurned, duration } }
    completedWorkouts: {},
    // Calorie log: { 'YYYY-MM-DD': { food: [...], exercise: [...] } }
    calorieLog: {},
    // Earned badges: ['badge_id', ...]
    earnedBadges: [],
    // Stats
    totalWorkouts: 0,
    totalCaloriesBurned: 0,
    calendarMonth: new Date().getMonth(),
    calendarYear: new Date().getFullYear()
  };

  // Timer state (not persisted)
  let timerState = {
    running: false,
    seconds: 0,
    interval: null
  };

  // ============================================================
  // STORAGE
  // ============================================================

  const STORAGE_KEY = 'fitbuddy_data';

  function saveState() {
    const toSave = {
      profile: state.profile,
      completedWorkouts: state.completedWorkouts,
      calorieLog: state.calorieLog,
      earnedBadges: state.earnedBadges,
      totalWorkouts: state.totalWorkouts,
      totalCaloriesBurned: state.totalCaloriesBurned
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        state.profile = { ...state.profile, ...data.profile };
        state.completedWorkouts = data.completedWorkouts || {};
        state.calorieLog = data.calorieLog || {};
        state.earnedBadges = data.earnedBadges || [];
        state.totalWorkouts = data.totalWorkouts || 0;
        state.totalCaloriesBurned = data.totalCaloriesBurned || 0;
      }
    } catch (e) {
      console.warn('Failed to load state:', e);
    }
  }

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  function dateKey(date) {
    const d = date || new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function getToday() {
    return new Date();
  }

  function getDayOfWeek(date) {
    // Convert JS day (0=Sun) to our format (0=Mon)
    const jsDay = date.getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  }

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? 6 : day - 1; // Monday as start
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getWeekDates(date) {
    const start = getWeekStart(date);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  }

  function getUserWeightLbs() {
    if (state.profile.weightUnit === 'kg') {
      return state.profile.weight * 2.205;
    }
    return state.profile.weight;
  }

  function calcCaloriesBurned(exerciseType, durationMinutes) {
    const baseRate = CALORIE_RATES[exerciseType] || 5.0;
    const weightFactor = getUserWeightLbs() / 155;
    return Math.round(baseRate * durationMinutes * weightFactor);
  }

  function getWorkoutsThisWeek() {
    const weekDates = getWeekDates(getToday());
    let count = 0;
    for (const d of weekDates) {
      if (state.completedWorkouts[dateKey(d)]) count++;
    }
    return count;
  }

  function getWeekStreak() {
    let streak = 0;
    const now = getToday();
    const currentWeekStart = getWeekStart(now);

    // Check if current week is complete (3 workouts) - if not, start from last week
    const currentWeekWorkouts = getWorkoutsInWeek(currentWeekStart);
    let checkWeek;
    if (currentWeekWorkouts >= 3) {
      streak = 1;
      checkWeek = new Date(currentWeekStart);
      checkWeek.setDate(checkWeek.getDate() - 7);
    } else {
      checkWeek = new Date(currentWeekStart);
      checkWeek.setDate(checkWeek.getDate() - 7);
      // Check last week first
      if (getWorkoutsInWeek(checkWeek) >= 3) {
        streak = 1;
        checkWeek.setDate(checkWeek.getDate() - 7);
      } else {
        return 0;
      }
    }

    // Keep counting backwards
    while (getWorkoutsInWeek(checkWeek) >= 3) {
      streak++;
      checkWeek.setDate(checkWeek.getDate() - 7);
    }

    return streak;
  }

  function getWorkoutsInWeek(weekStart) {
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      if (state.completedWorkouts[dateKey(d)]) count++;
    }
    return count;
  }

  function getCalorieLogStreak() {
    let streak = 0;
    const d = new Date(getToday());
    // Check from today backwards
    while (true) {
      const log = state.calorieLog[dateKey(d)];
      if (log && ((log.food && log.food.length > 0) || (log.exercise && log.exercise.length > 0))) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  function getTodayCalories() {
    const key = dateKey();
    const log = state.calorieLog[key] || { food: [], exercise: [] };
    const consumed = log.food.reduce((sum, f) => sum + f.calories, 0);
    const burned = log.exercise.reduce((sum, e) => sum + e.calories, 0);
    return { consumed, burned, net: consumed - burned };
  }

  function getTodayWorkout() {
    if (!state.profile.setupComplete) return null;
    const dayIndex = getDayOfWeek(getToday());
    const workoutDayIndex = state.profile.workoutDays.indexOf(dayIndex);
    if (workoutDayIndex === -1) return null;
    const plan = WORKOUT_PLANS[state.profile.level];
    return { ...plan[workoutDayIndex], dayIndex: workoutDayIndex };
  }

  function isTodayWorkoutComplete() {
    return !!state.completedWorkouts[dateKey()];
  }

  function getWorkoutForDate(date) {
    if (!state.profile.setupComplete) return null;
    const dayIndex = getDayOfWeek(date);
    const workoutDayIndex = state.profile.workoutDays.indexOf(dayIndex);
    if (workoutDayIndex === -1) return null;
    const plan = WORKOUT_PLANS[state.profile.level];
    return { ...plan[workoutDayIndex], dayIndex: workoutDayIndex };
  }

  // ============================================================
  // BADGE CHECKING
  // ============================================================

  function checkBadges() {
    const stats = {
      totalWorkouts: state.totalWorkouts,
      workoutsThisWeek: getWorkoutsThisWeek(),
      weekStreak: getWeekStreak(),
      calorieLogStreak: getCalorieLogStreak(),
      totalCaloriesBurned: state.totalCaloriesBurned
    };

    const newBadges = [];
    for (const badge of BADGES) {
      if (!state.earnedBadges.includes(badge.id) && badge.check(stats)) {
        state.earnedBadges.push(badge.id);
        newBadges.push(badge);
      }
    }

    if (newBadges.length > 0) {
      saveState();
    }

    return newBadges;
  }

  // ============================================================
  // CONFETTI
  // ============================================================

  function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiColors = [
      '#FF6B6B', '#4ECDC4', '#FFE66D', '#6C63FF',
      '#FF8A5C', '#F093FB', '#A8E6CF', '#4FACFE'
    ];

    const pieces = [];
    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 4,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;
      for (const p of pieces) {
        if (p.y > canvas.height + 20) continue;
        active = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      frame++;
      if (active && frame < 300) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animate();
  }

  // ============================================================
  // TOAST
  // ============================================================

  function showToast(message, icon) {
    const toast = document.getElementById('toast');
    toast.querySelector('.toast-message').textContent = message;
    toast.querySelector('.toast-icon').textContent = icon || '\u2714\uFE0F';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ============================================================
  // MODAL
  // ============================================================

  function showModal(id) {
    document.getElementById(id).classList.add('show');
  }

  function hideModal(id) {
    document.getElementById(id).classList.remove('show');
  }

  // ============================================================
  // NAVIGATION
  // ============================================================

  function switchTab(tabName) {
    state.currentTab = tabName;

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    document.querySelectorAll('.tab-content').forEach(section => {
      section.classList.toggle('active', section.id === tabName);
    });

    // Render tab content
    switch (tabName) {
      case 'dashboard': renderDashboard(); break;
      case 'workouts': renderWorkouts(); break;
      case 'calories': renderCalories(); break;
      case 'calendar': renderCalendar(); break;
      case 'rewards': renderRewards(); break;
    }
  }

  // ============================================================
  // RENDER: DASHBOARD
  // ============================================================

  function renderDashboard() {
    // Motivational quote
    const quoteEl = document.getElementById('motivation-quote');
    const quoteIndex = Math.floor(Date.now() / (1000 * 60 * 60)) % MOTIVATIONAL_QUOTES.length;
    quoteEl.textContent = MOTIVATIONAL_QUOTES[quoteIndex];

    // Stats
    document.getElementById('dash-workouts-week').textContent = getWorkoutsThisWeek();
    const todayCal = getTodayCalories();
    document.getElementById('dash-calories-burned').textContent = todayCal.burned;
    document.getElementById('dash-streak').textContent = getWeekStreak();
    document.getElementById('dash-badges').textContent = state.earnedBadges.length;

    // Calorie quick view
    const maxCal = Math.max(todayCal.consumed, todayCal.burned, state.profile.calorieGoal, 1);
    const inPct = Math.min((todayCal.consumed / maxCal) * 100, 100);
    const outPct = Math.min((todayCal.burned / maxCal) * 100, 100);

    document.getElementById('dash-cal-in-bar').style.width = inPct + '%';
    document.getElementById('dash-cal-out-bar').style.width = outPct + '%';
    document.getElementById('dash-cal-in-value').textContent = todayCal.consumed;
    document.getElementById('dash-cal-out-value').textContent = todayCal.burned;

    const netEl = document.getElementById('dash-net-calories');
    netEl.querySelector('.net-value').textContent = todayCal.net;

    // Today's workout
    renderTodayWorkoutPreview();

    // Recent badges
    renderRecentBadges();
  }

  function renderTodayWorkoutPreview() {
    const container = document.getElementById('today-workout-preview');
    const workout = getTodayWorkout();

    if (!state.profile.setupComplete) {
      container.innerHTML = `
        <div class="rest-day">
          <span class="rest-icon">\u{1F3CB}</span>
          <p>Set up your workout schedule to get started!</p>
          <button class="btn btn-primary btn-small" onclick="FitBuddy.switchTab('workouts')">
            Set Up Workouts
          </button>
        </div>`;
      return;
    }

    if (!workout) {
      container.innerHTML = `
        <div class="rest-day">
          <span class="rest-icon">\u{1F6CC}</span>
          <p>Rest day! Your muscles are recovering and getting stronger.</p>
        </div>`;
      return;
    }

    const isComplete = isTodayWorkoutComplete();
    const typeClass = 'type-' + workout.type;

    container.innerHTML = `
      <div class="workout-preview-card ${typeClass}" onclick="FitBuddy.startWorkoutView(${workout.dayIndex})">
        <div class="workout-preview-name">${workout.name}</div>
        <div class="workout-preview-info">
          <span>\u{23F1} ~60 min</span>
          <span>\u{1F525} ~${workout.estimatedCalories} cal</span>
          <span>\u{1F4AA} ${capitalize(state.profile.level)}</span>
        </div>
        <div class="workout-preview-action">
          ${isComplete
        ? '<span class="completed-badge">\u2714 Completed Today</span>'
        : '<button class="btn btn-small">Start Workout \u{25B6}</button>'}
        </div>
      </div>`;
  }

  function renderRecentBadges() {
    const section = document.getElementById('recent-badges-section');
    const container = document.getElementById('recent-badges');

    if (state.earnedBadges.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = '';
    const recent = state.earnedBadges.slice(-4);
    container.innerHTML = recent.map(id => {
      const badge = BADGES.find(b => b.id === id);
      return `
        <div class="badge-item earned">
          <span class="badge-icon">${badge.icon}</span>
          <span class="badge-name">${badge.name}</span>
        </div>`;
    }).join('');
  }

  // ============================================================
  // RENDER: WORKOUTS
  // ============================================================

  function renderWorkouts() {
    if (state.profile.setupComplete) {
      document.getElementById('workout-setup').style.display = 'none';
      document.getElementById('weekly-plan').style.display = '';
      document.getElementById('active-workout').style.display = 'none';
      renderWeeklyPlan();
    } else {
      document.getElementById('workout-setup').style.display = '';
      document.getElementById('weekly-plan').style.display = 'none';
      document.getElementById('active-workout').style.display = 'none';
      renderSetupForm();
    }
  }

  function renderSetupForm() {
    // Restore values
    const weightInput = document.getElementById('user-weight');
    if (state.profile.weight) weightInput.value = state.profile.weight;
    document.getElementById('weight-unit').value = state.profile.weightUnit;

    // Level buttons
    document.querySelectorAll('.level-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === state.profile.level);
    });

    // Day buttons
    document.querySelectorAll('.day-btn').forEach(btn => {
      btn.classList.toggle('selected', state.profile.workoutDays.includes(parseInt(btn.dataset.day)));
    });
    document.getElementById('days-selected').textContent = state.profile.workoutDays.length;
    document.getElementById('save-setup-btn').disabled = state.profile.workoutDays.length !== 3;
  }

  function renderWeeklyPlan() {
    const container = document.getElementById('workout-cards-container');
    const weekDates = getWeekDates(getToday());
    const today = dateKey();
    const plan = WORKOUT_PLANS[state.profile.level];

    let html = '';
    for (let i = 0; i < 7; i++) {
      const date = weekDates[i];
      const key = dateKey(date);
      const isToday = key === today;
      const workoutDayIndex = state.profile.workoutDays.indexOf(i);
      const isWorkoutDay = workoutDayIndex !== -1;
      const workout = isWorkoutDay ? plan[workoutDayIndex] : null;
      const isComplete = !!state.completedWorkouts[key];
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

      if (isWorkoutDay) {
        const typeClass = 'type-' + workout.type;
        const completedClass = isComplete ? 'completed' : '';
        let statusHtml = '';
        if (isComplete) {
          statusHtml = '<span class="workout-card-status status-completed">\u2714 Done</span>';
        } else if (isToday) {
          statusHtml = '<span class="workout-card-status status-today">Today</span>';
        } else if (isPast) {
          statusHtml = '<span class="workout-card-status" style="background:rgba(255,107,107,0.1);color:#FF6B6B;">Missed</span>';
        } else {
          statusHtml = '<span class="workout-card-status status-scheduled">Scheduled</span>';
        }

        html += `
          <div class="workout-card ${typeClass} ${completedClass}"
               onclick="FitBuddy.startWorkoutView(${workoutDayIndex})">
            <div class="workout-card-header">
              <div>
                <span class="workout-card-day">${DAY_NAMES[date.getDay()]}${isToday ? ' (Today)' : ''}</span>
                <div class="workout-card-name">${workout.name}</div>
              </div>
              ${statusHtml}
            </div>
            <div class="workout-card-meta">
              <span>\u{23F1} ~60 min</span>
              <span>\u{1F525} ~${workout.estimatedCalories} cal</span>
            </div>
          </div>`;
      } else {
        html += `
          <div class="workout-card type-rest">
            <div class="workout-card-header">
              <div>
                <span class="workout-card-day">${DAY_NAMES[date.getDay()]}${isToday ? ' (Today)' : ''}</span>
                <div class="workout-card-name">Rest Day</div>
              </div>
              <span class="workout-card-status status-rest">\u{1F6CC} Rest</span>
            </div>
          </div>`;
      }
    }

    container.innerHTML = html;
  }

  function startWorkoutView(workoutDayIndex) {
    const plan = WORKOUT_PLANS[state.profile.level];
    const workout = plan[workoutDayIndex];

    document.getElementById('workout-setup').style.display = 'none';
    document.getElementById('weekly-plan').style.display = 'none';
    document.getElementById('active-workout').style.display = '';

    document.getElementById('active-workout-title').textContent = workout.name;

    // Reset timer
    stopTimer();
    timerState.seconds = 0;
    updateTimerDisplay();

    // Render exercises
    const container = document.getElementById('active-exercise-list');
    let html = '';
    for (const phase of workout.phases) {
      html += `<div class="exercise-phase">
        <div class="phase-title">${phase.name} (${phase.duration})</div>`;

      for (const ex of phase.exercises) {
        const exerciseData = EXERCISES[ex.id];
        const reps = exerciseData
          ? (exerciseData[state.profile.level] || '')
          : '';
        html += `
          <div class="exercise-item" data-exercise="${ex.id}">
            <div class="exercise-check" onclick="this.classList.toggle('checked'); event.stopPropagation();">\u2714</div>
            <div class="exercise-info">
              <div class="exercise-name">${exerciseData ? exerciseData.name : ex.id}</div>
              <div class="exercise-detail">${exerciseData ? exerciseData.target : ''} ${reps ? '- ' + reps : ''}</div>
            </div>
            <div class="exercise-duration">${ex.duration}</div>
          </div>`;
      }
      html += '</div>';
    }
    container.innerHTML = html;

    // Store active workout index
    container.dataset.workoutIndex = workoutDayIndex;
  }

  function completeWorkout() {
    const container = document.getElementById('active-exercise-list');
    const workoutDayIndex = parseInt(container.dataset.workoutIndex);
    const plan = WORKOUT_PLANS[state.profile.level];
    const workout = plan[workoutDayIndex];

    const key = dateKey();
    const caloriesBurned = workout.estimatedCalories;
    const duration = timerState.seconds;

    // Record completion
    state.completedWorkouts[key] = {
      workoutIndex: workoutDayIndex,
      caloriesBurned,
      duration,
      workoutName: workout.name,
      completedAt: new Date().toISOString()
    };

    state.totalWorkouts++;
    state.totalCaloriesBurned += caloriesBurned;

    // Also add to calorie exercise log
    if (!state.calorieLog[key]) state.calorieLog[key] = { food: [], exercise: [] };
    state.calorieLog[key].exercise.push({
      name: workout.name + ' (Workout)',
      type: 'bodyweight_moderate',
      duration: 60,
      calories: caloriesBurned,
      id: Date.now()
    });

    stopTimer();
    saveState();

    // Check for new badges
    const newBadges = checkBadges();

    // Show celebration
    showCelebration(workout, caloriesBurned, duration, newBadges);
  }

  function showCelebration(workout, caloriesBurned, duration, newBadges) {
    const message = document.getElementById('celebration-message');
    message.textContent = `You crushed ${workout.name}! Keep up the amazing work!`;

    const stats = document.getElementById('celebration-stats');
    const durationStr = duration > 0
      ? Math.floor(duration / 60) + ':' + String(duration % 60).padStart(2, '0')
      : '~60:00';
    stats.innerHTML = `
      <div class="celebration-stat">
        <span class="celebration-stat-value">${caloriesBurned}</span>
        <span class="celebration-stat-label">Calories Burned</span>
      </div>
      <div class="celebration-stat">
        <span class="celebration-stat-value">${durationStr}</span>
        <span class="celebration-stat-label">Duration</span>
      </div>
      <div class="celebration-stat">
        <span class="celebration-stat-value">${state.totalWorkouts}</span>
        <span class="celebration-stat-label">Total Workouts</span>
      </div>`;

    const badgesEl = document.getElementById('celebration-badges');
    if (newBadges.length > 0) {
      badgesEl.innerHTML = '<p style="font-weight:700;margin-bottom:8px;">New Badges Unlocked!</p>' +
        newBadges.map(b => `
          <div class="badge-item earned" style="display:inline-block;margin:4px;">
            <span class="badge-icon">${b.icon}</span>
            <span class="badge-name">${b.name}</span>
          </div>`).join('');
    } else {
      badgesEl.innerHTML = '';
    }

    showModal('celebration-modal');
    launchConfetti();
  }

  // ============================================================
  // TIMER
  // ============================================================

  function startTimer() {
    if (timerState.running) return;
    timerState.running = true;
    document.getElementById('timer-start-btn').style.display = 'none';
    document.getElementById('timer-pause-btn').style.display = '';
    timerState.interval = setInterval(() => {
      timerState.seconds++;
      updateTimerDisplay();
    }, 1000);
  }

  function pauseTimer() {
    timerState.running = false;
    document.getElementById('timer-start-btn').style.display = '';
    document.getElementById('timer-pause-btn').style.display = 'none';
    clearInterval(timerState.interval);
  }

  function resetTimer() {
    stopTimer();
    timerState.seconds = 0;
    updateTimerDisplay();
    document.getElementById('timer-start-btn').style.display = '';
    document.getElementById('timer-pause-btn').style.display = 'none';
  }

  function stopTimer() {
    timerState.running = false;
    clearInterval(timerState.interval);
  }

  function updateTimerDisplay() {
    const mins = Math.floor(timerState.seconds / 60);
    const secs = timerState.seconds % 60;
    document.getElementById('workout-timer').textContent =
      String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }

  // ============================================================
  // RENDER: CALORIES
  // ============================================================

  function renderCalories() {
    const todayCal = getTodayCalories();

    // Update ring chart
    updateCalorieRing(todayCal);

    // Update text values
    document.getElementById('cal-total-consumed').textContent = todayCal.consumed;
    document.getElementById('cal-total-burned').textContent = todayCal.burned;
    document.getElementById('cal-ring-net').textContent = todayCal.net;
    document.getElementById('cal-goal-display').textContent = state.profile.calorieGoal;
    document.getElementById('calorie-goal-input').value = state.profile.calorieGoal;

    // Render quick-add foods
    renderQuickFoods();

    // Render quick-add exercises
    renderQuickExercises();

    // Render logs
    renderFoodLog();
    renderExerciseLog();
  }

  function updateCalorieRing(todayCal) {
    const goal = state.profile.calorieGoal || 2000;

    // Consumed ring (outer, circumference = 2 * PI * 85 ≈ 534)
    const consumedPct = Math.min(todayCal.consumed / goal, 1.5);
    const consumedOffset = 534 - (534 * consumedPct);
    document.getElementById('ring-consumed').style.strokeDashoffset = consumedOffset;

    // Burned ring (inner, circumference = 2 * PI * 70 ≈ 440)
    const burnedMax = Math.max(todayCal.consumed, goal);
    const burnedPct = burnedMax > 0 ? Math.min(todayCal.burned / burnedMax, 1.5) : 0;
    const burnedOffset = 440 - (440 * burnedPct);
    document.getElementById('ring-burned').style.strokeDashoffset = burnedOffset;
  }

  function renderQuickFoods() {
    const container = document.getElementById('quick-food-grid');
    container.innerHTML = COMMON_FOODS.slice(0, 9).map((food, i) => `
      <div class="quick-add-item" onclick="FitBuddy.quickAddFood(${i})">
        <span class="quick-add-icon">${food.icon}</span>
        <span class="quick-add-name">${food.name}</span>
        <span class="quick-add-cal">${food.calories} cal</span>
      </div>`).join('');
  }

  function renderQuickExercises() {
    const container = document.getElementById('quick-exercise-grid');
    container.innerHTML = COMMON_EXERCISES.map((ex, i) => `
      <div class="quick-add-item" onclick="FitBuddy.quickAddExercise(${i})">
        <span class="quick-add-icon">${ex.icon}</span>
        <span class="quick-add-name">${ex.name}</span>
        <span class="quick-add-cal">${calcCaloriesBurned(ex.type, ex.duration)} cal</span>
      </div>`).join('');
  }

  function renderFoodLog() {
    const container = document.getElementById('food-log-entries');
    const key = dateKey();
    const log = state.calorieLog[key];

    if (!log || !log.food || log.food.length === 0) {
      container.innerHTML = '<p class="empty-state">No food logged today. Add your meals above!</p>';
      return;
    }

    const mealIcons = { breakfast: '\u{2600}', lunch: '\u{1F31E}', dinner: '\u{1F319}', snack: '\u{2B50}' };

    container.innerHTML = log.food.map(item => `
      <div class="log-entry">
        <span class="log-entry-icon">${mealIcons[item.meal] || '\u{1F37D}'}</span>
        <div class="log-entry-info">
          <div class="log-entry-name">${escapeHtml(item.name)}</div>
          <div class="log-entry-detail">${capitalize(item.meal)}</div>
        </div>
        <span class="log-entry-cal cal-positive">+${item.calories}</span>
        <button class="log-entry-delete" onclick="FitBuddy.deleteFoodEntry(${item.id})">\u00D7</button>
      </div>`).join('');
  }

  function renderExerciseLog() {
    const container = document.getElementById('exercise-log-entries');
    const key = dateKey();
    const log = state.calorieLog[key];

    if (!log || !log.exercise || log.exercise.length === 0) {
      container.innerHTML = '<p class="empty-state">No exercises logged today. Get moving!</p>';
      return;
    }

    container.innerHTML = log.exercise.map(item => `
      <div class="log-entry">
        <span class="log-entry-icon">\u{1F3C3}</span>
        <div class="log-entry-info">
          <div class="log-entry-name">${escapeHtml(item.name)}</div>
          <div class="log-entry-detail">${item.duration} min${item.distance ? ' - ' + item.distance + ' mi' : ''}</div>
        </div>
        <span class="log-entry-cal cal-negative">-${item.calories}</span>
        <button class="log-entry-delete" onclick="FitBuddy.deleteExerciseEntry(${item.id})">\u00D7</button>
      </div>`).join('');
  }

  function quickAddFood(index) {
    const food = COMMON_FOODS[index];
    addFoodEntry(food.name, food.calories, food.meal);
  }

  function quickAddExercise(index) {
    const ex = COMMON_EXERCISES[index];
    const calories = calcCaloriesBurned(ex.type, ex.duration);
    addExerciseEntry(ex.name, ex.type, ex.duration, calories, null);
  }

  function addFoodEntry(name, calories, meal) {
    const key = dateKey();
    if (!state.calorieLog[key]) state.calorieLog[key] = { food: [], exercise: [] };
    state.calorieLog[key].food.push({
      name, calories, meal, id: Date.now()
    });
    saveState();
    checkBadges();
    showToast(name + ' added!', '\u{1F37D}');

    if (state.currentTab === 'calories') renderCalories();
    if (state.currentTab === 'dashboard') renderDashboard();
  }

  function addExerciseEntry(name, type, duration, calories, distance) {
    const key = dateKey();
    if (!state.calorieLog[key]) state.calorieLog[key] = { food: [], exercise: [] };
    state.calorieLog[key].exercise.push({
      name, type, duration, calories, distance, id: Date.now()
    });
    state.totalCaloriesBurned += calories;
    saveState();
    checkBadges();
    showToast(calories + ' calories burned!', '\u{1F525}');

    if (state.currentTab === 'calories') renderCalories();
    if (state.currentTab === 'dashboard') renderDashboard();
  }

  function deleteFoodEntry(id) {
    const key = dateKey();
    const log = state.calorieLog[key];
    if (log && log.food) {
      log.food = log.food.filter(f => f.id !== id);
      saveState();
      renderCalories();
    }
  }

  function deleteExerciseEntry(id) {
    const key = dateKey();
    const log = state.calorieLog[key];
    if (log && log.exercise) {
      const entry = log.exercise.find(e => e.id === id);
      if (entry) {
        state.totalCaloriesBurned = Math.max(0, state.totalCaloriesBurned - entry.calories);
      }
      log.exercise = log.exercise.filter(e => e.id !== id);
      saveState();
      renderCalories();
    }
  }

  function saveCustomFood() {
    const name = document.getElementById('food-name-input').value.trim();
    const calories = parseInt(document.getElementById('food-cal-input').value);
    const meal = document.getElementById('food-meal-select').value;

    if (!name || !calories || calories <= 0) {
      showToast('Please fill in all fields', '\u{26A0}');
      return;
    }

    addFoodEntry(name, calories, meal);
    hideModal('food-modal');

    // Reset form
    document.getElementById('food-name-input').value = '';
    document.getElementById('food-cal-input').value = '';
  }

  function saveCustomExercise() {
    const type = document.getElementById('exercise-type-select').value;
    const duration = parseInt(document.getElementById('exercise-duration-input').value);
    const distance = parseFloat(document.getElementById('exercise-distance-input').value) || null;
    const customCal = parseInt(document.getElementById('exercise-custom-cal').value) || 0;

    if (!duration || duration <= 0) {
      showToast('Please enter duration', '\u{26A0}');
      return;
    }

    const calories = type === 'custom' ? customCal : calcCaloriesBurned(type, duration);
    const typeName = document.getElementById('exercise-type-select')
      .options[document.getElementById('exercise-type-select').selectedIndex].text;

    if (calories <= 0) {
      showToast('Please enter calories for custom exercises', '\u{26A0}');
      return;
    }

    addExerciseEntry(typeName, type, duration, calories, distance);
    hideModal('exercise-modal');

    // Reset form
    document.getElementById('exercise-duration-input').value = '';
    document.getElementById('exercise-distance-input').value = '';
    document.getElementById('exercise-custom-cal').value = '';
  }

  function updateExerciseEstimate() {
    const type = document.getElementById('exercise-type-select').value;
    const duration = parseInt(document.getElementById('exercise-duration-input').value) || 0;
    const estimateEl = document.getElementById('exercise-calorie-estimate');
    const customGroup = document.getElementById('custom-cal-group');

    if (type === 'custom') {
      customGroup.style.display = '';
      estimateEl.textContent = 'Enter calories manually for custom exercises';
    } else {
      customGroup.style.display = 'none';
      const calories = calcCaloriesBurned(type, duration);
      estimateEl.textContent = `Estimated: ~${calories} calories`;
    }
  }

  // ============================================================
  // RENDER: CALENDAR
  // ============================================================

  function renderCalendar() {
    renderCalendarGrid();
    renderMonthlyStats();
  }

  function renderCalendarGrid() {
    const year = state.calendarYear;
    const month = state.calendarMonth;

    document.getElementById('calendar-month-title').textContent =
      MONTH_NAMES[month] + ' ' + year;

    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = dateKey();

    const container = document.getElementById('calendar-days');
    let html = '';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      html += '<div class="calendar-day empty"></div>';
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const key = dateKey(date);
      const isToday = key === today;
      const dayOfWeek = getDayOfWeek(date);
      const isWorkoutDay = state.profile.setupComplete && state.profile.workoutDays.includes(dayOfWeek);
      const isComplete = !!state.completedWorkouts[key];
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

      let classes = 'calendar-day';
      let indicator = '';

      if (isToday) classes += ' today';

      if (isComplete) {
        classes += ' completed';
        indicator = '<span class="day-indicator completed"></span>';
      } else if (isWorkoutDay && isPast) {
        classes += ' missed';
        indicator = '<span class="day-indicator missed"></span>';
      } else if (isWorkoutDay) {
        classes += ' scheduled';
        indicator = '<span class="day-indicator scheduled"></span>';
      }

      html += `
        <div class="${classes}" onclick="FitBuddy.showDayDetail('${key}')">
          <span>${d}</span>
          ${indicator}
        </div>`;
    }

    container.innerHTML = html;
  }

  function changeMonth(delta) {
    state.calendarMonth += delta;
    if (state.calendarMonth > 11) {
      state.calendarMonth = 0;
      state.calendarYear++;
    } else if (state.calendarMonth < 0) {
      state.calendarMonth = 11;
      state.calendarYear--;
    }
    renderCalendar();
  }

  function showDayDetail(key) {
    const detailSection = document.getElementById('calendar-day-detail');
    const dateTitle = document.getElementById('cal-detail-date');
    const content = document.getElementById('cal-detail-content');

    const parts = key.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    dateTitle.textContent = DAY_NAMES[date.getDay()] + ', ' +
      MONTH_NAMES[date.getMonth()] + ' ' + date.getDate();

    let html = '';

    // Workout info
    const completed = state.completedWorkouts[key];
    if (completed) {
      html += `
        <div style="padding:12px;background:linear-gradient(135deg,rgba(67,233,123,0.1),rgba(56,249,215,0.05));border-radius:10px;margin-bottom:10px;">
          <strong>\u2714 ${completed.workoutName}</strong><br>
          <span style="font-size:0.85rem;color:var(--text-light);">
            \u{1F525} ${completed.caloriesBurned} cal burned
          </span>
        </div>`;
    } else {
      const workout = getWorkoutForDate(date);
      if (workout) {
        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
        if (isPast) {
          html += `<p style="color:var(--coral);">Missed: ${workout.name}</p>`;
        } else {
          html += `<p style="color:var(--primary);">Scheduled: ${workout.name}</p>`;
        }
      } else {
        html += '<p style="color:var(--text-light);">Rest day</p>';
      }
    }

    // Calorie info
    const log = state.calorieLog[key];
    if (log) {
      const consumed = (log.food || []).reduce((s, f) => s + f.calories, 0);
      const burned = (log.exercise || []).reduce((s, e) => s + e.calories, 0);
      if (consumed > 0 || burned > 0) {
        html += `
          <div style="margin-top:8px;font-size:0.85rem;">
            <span style="color:var(--coral);">Eaten: ${consumed} cal</span> |
            <span style="color:var(--teal);">Burned: ${burned} cal</span> |
            <strong>Net: ${consumed - burned} cal</strong>
          </div>`;
      }
    }

    if (!html) {
      html = '<p style="color:var(--text-lighter);">No activity recorded for this day.</p>';
    }

    content.innerHTML = html;
    detailSection.style.display = '';
  }

  function renderMonthlyStats() {
    const container = document.getElementById('monthly-stats');
    const year = state.calendarYear;
    const month = state.calendarMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let workouts = 0;
    let caloriesBurned = 0;
    let scheduled = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const key = dateKey(date);
      const dayOfWeek = getDayOfWeek(date);

      if (state.profile.setupComplete && state.profile.workoutDays.includes(dayOfWeek)) {
        scheduled++;
      }

      if (state.completedWorkouts[key]) {
        workouts++;
        caloriesBurned += state.completedWorkouts[key].caloriesBurned || 0;
      }
    }

    container.innerHTML = `
      <div class="monthly-stat-item">
        <span class="monthly-stat-value">${workouts}</span>
        <span class="monthly-stat-label">Workouts Done</span>
      </div>
      <div class="monthly-stat-item">
        <span class="monthly-stat-value">${scheduled}</span>
        <span class="monthly-stat-label">Scheduled</span>
      </div>
      <div class="monthly-stat-item">
        <span class="monthly-stat-value">${caloriesBurned.toLocaleString()}</span>
        <span class="monthly-stat-label">Cal Burned</span>
      </div>`;
  }

  // ============================================================
  // RENDER: REWARDS
  // ============================================================

  function renderRewards() {
    // Streak
    const streak = getWeekStreak();
    document.getElementById('reward-streak').textContent = streak;

    // Stats
    document.getElementById('total-workouts-stat').textContent = state.totalWorkouts;
    document.getElementById('total-calories-stat').textContent =
      state.totalCaloriesBurned.toLocaleString();
    document.getElementById('total-badges-stat').textContent = state.earnedBadges.length;

    // Badge grid
    const badgeGrid = document.getElementById('badge-grid');
    badgeGrid.innerHTML = BADGES.map(badge => {
      const earned = state.earnedBadges.includes(badge.id);
      return `
        <div class="badge-item ${earned ? 'earned' : 'locked'}">
          <span class="badge-icon">${badge.icon}</span>
          <span class="badge-name">${badge.name}</span>
          <span class="badge-desc">${badge.description}</span>
        </div>`;
    }).join('');

    // Milestones
    renderMilestones();
  }

  function renderMilestones() {
    const container = document.getElementById('milestones-list');
    const milestones = [
      {
        icon: '\u{1F4AA}',
        name: 'Workout Master',
        current: state.totalWorkouts,
        targets: [1, 10, 25, 50, 100],
        unit: 'workouts'
      },
      {
        icon: '\u{1F525}',
        name: 'Calorie Incinerator',
        current: state.totalCaloriesBurned,
        targets: [500, 1000, 5000, 10000, 25000],
        unit: 'cal'
      },
      {
        icon: '\u{1F525}',
        name: 'Streak Builder',
        current: getWeekStreak(),
        targets: [1, 2, 4, 8, 12],
        unit: 'weeks'
      }
    ];

    container.innerHTML = milestones.map(m => {
      const nextTarget = m.targets.find(t => t > m.current) || m.targets[m.targets.length - 1];
      const progress = Math.min((m.current / nextTarget) * 100, 100);
      const isComplete = m.current >= nextTarget;

      return `
        <div class="milestone-item">
          <span class="milestone-icon">${m.icon}</span>
          <div class="milestone-info">
            <div class="milestone-name">${m.name}</div>
            <div class="milestone-progress">
              ${isComplete ? 'All milestones reached!' : m.current + ' / ' + nextTarget + ' ' + m.unit}
            </div>
            <div class="milestone-bar">
              <div class="milestone-bar-fill" style="width: ${progress}%"></div>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  // ============================================================
  // HELPERS
  // ============================================================

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================================
  // EVENT LISTENERS
  // ============================================================

  function initEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Workout setup - day selection
    document.querySelectorAll('.day-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const day = parseInt(btn.dataset.day);
        const idx = state.profile.workoutDays.indexOf(day);
        if (idx !== -1) {
          state.profile.workoutDays.splice(idx, 1);
          btn.classList.remove('selected');
        } else if (state.profile.workoutDays.length < 3) {
          state.profile.workoutDays.push(day);
          state.profile.workoutDays.sort((a, b) => a - b);
          btn.classList.add('selected');
        }
        document.getElementById('days-selected').textContent = state.profile.workoutDays.length;
        document.getElementById('save-setup-btn').disabled = state.profile.workoutDays.length !== 3;
      });
    });

    // Level buttons
    document.querySelectorAll('.level-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.profile.level = btn.dataset.level;
      });
    });

    // Save setup
    document.getElementById('save-setup-btn').addEventListener('click', () => {
      const weight = parseInt(document.getElementById('user-weight').value);
      if (weight) state.profile.weight = weight;
      state.profile.weightUnit = document.getElementById('weight-unit').value;
      state.profile.setupComplete = true;
      saveState();
      showToast('Workout plan created!', '\u{1F389}');
      renderWorkouts();
    });

    // Edit plan
    document.getElementById('edit-plan-btn').addEventListener('click', () => {
      state.profile.setupComplete = false;
      renderWorkouts();
    });

    // Back to plan from active workout
    document.getElementById('back-to-plan-btn').addEventListener('click', () => {
      stopTimer();
      document.getElementById('active-workout').style.display = 'none';
      document.getElementById('weekly-plan').style.display = '';
    });

    // Timer controls
    document.getElementById('timer-start-btn').addEventListener('click', startTimer);
    document.getElementById('timer-pause-btn').addEventListener('click', pauseTimer);
    document.getElementById('timer-reset-btn').addEventListener('click', resetTimer);

    // Complete workout
    document.getElementById('complete-workout-btn').addEventListener('click', completeWorkout);

    // Celebration modal close -> back to plan
    document.querySelector('#celebration-modal [data-close]').addEventListener('click', () => {
      hideModal('celebration-modal');
      document.getElementById('active-workout').style.display = 'none';
      document.getElementById('weekly-plan').style.display = '';
      renderWeeklyPlan();
    });

    // Calorie goal
    document.getElementById('set-goal-btn').addEventListener('click', () => {
      const goal = parseInt(document.getElementById('calorie-goal-input').value);
      if (goal && goal > 0) {
        state.profile.calorieGoal = goal;
        saveState();
        showToast('Calorie goal updated!', '\u{1F3AF}');
        renderCalories();
      }
    });

    // Add food modal
    document.getElementById('add-food-btn').addEventListener('click', () => showModal('food-modal'));
    document.getElementById('save-food-btn').addEventListener('click', saveCustomFood);

    // Add exercise modal
    document.getElementById('add-exercise-cal-btn').addEventListener('click', () => showModal('exercise-modal'));
    document.getElementById('save-exercise-btn').addEventListener('click', saveCustomExercise);

    // Exercise type change -> update estimate
    document.getElementById('exercise-type-select').addEventListener('change', updateExerciseEstimate);
    document.getElementById('exercise-duration-input').addEventListener('input', updateExerciseEstimate);

    // Calendar navigation
    document.getElementById('cal-prev-month').addEventListener('click', () => changeMonth(-1));
    document.getElementById('cal-next-month').addEventListener('click', () => changeMonth(1));

    // Modal close buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => hideModal(btn.dataset.close));
    });

    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hideModal(overlay.id);
      });
    });
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  function init() {
    loadState();
    initEventListeners();
    switchTab('dashboard');

    // Check badges on load
    checkBadges();
  }

  // Expose public API
  window.FitBuddy = {
    switchTab,
    startWorkoutView,
    quickAddFood,
    quickAddExercise,
    deleteFoodEntry,
    deleteExerciseEntry,
    showDayDetail
  };

  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
