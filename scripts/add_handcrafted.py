import json
from pathlib import Path

path = Path('C:/Users/daeho/daehoonchung/Rescratch/data/challenges.json')
data = json.loads(path.read_text(encoding='utf-8'))

new_challenges = [
  {
    "id": "caffeine_cognitive_performance",
    "title": "Does caffeine improve short-term memory test scores?",
    "difficulty": "beginner",
    "level": 11,
    "description": "You want to test whether consuming 200mg of caffeine before a memory test improves scores compared to a placebo. Participants are randomly assigned to caffeine or placebo groups.",
    "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
    "hints": ["You assign participants to caffeine vs. placebo — that is a controlled manipulation.","Memory test scores are numerical. What data collection type fits?","Control for: baseline memory score, time of day, sleep quality the night before."],
    "tags": ["experiment","quantitative","neuroscience","caffeine"],
    "pillar": "science",
    "subtopic": "biology_organismal"
  },
  {
    "id": "social_media_sleep",
    "title": "Does social media use before bed affect sleep quality?",
    "difficulty": "beginner",
    "level": 12,
    "description": "You hypothesise that using social media for 60+ minutes before sleep reduces sleep quality. You will recruit participants and track their screen time and sleep patterns over two weeks.",
    "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
    "hints": ["Participants choose their own screen habits. What method does that suggest?","Sleep quality score (PSQI) is a numerical measure.","Control for: age, caffeine intake, exercise habits, bedroom light levels."],
    "tags": ["survey","quantitative","psychology","sleep","social-media"],
    "pillar": "human_social",
    "subtopic": "psychology"
  },
  {
    "id": "temperature_reaction_rate",
    "title": "Does temperature affect the rate of an enzyme-catalysed reaction?",
    "difficulty": "beginner",
    "level": 13,
    "description": "You will test how varying temperature (10-50 degrees C) affects the rate at which catalase breaks down hydrogen peroxide, measuring oxygen bubble output per minute.",
    "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
    "hints": ["You set the temperature directly using a water bath. What method does that imply?","Bubble production rate (mL/min) is a continuous numerical measurement.","Control for: enzyme concentration, substrate concentration, pH, reaction time."],
    "tags": ["experiment","quantitative","chemistry","enzymes"],
    "pillar": "science",
    "subtopic": "chemistry_organic"
  },
  {
    "id": "sample_size_confidence_interval",
    "title": "Does sample size affect confidence interval width?",
    "difficulty": "beginner",
    "level": 14,
    "description": "You want to demonstrate empirically how increasing sample size (10, 50, 100, 500, 1000) narrows the 95% confidence interval for a population mean, using simulation.",
    "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
    "hints": ["You choose the sample sizes deliberately in a simulation. What method applies?","CI width is a numerical outcome you calculate from each sample.","Keep population distribution and confidence level (95%) constant across all trials."],
    "tags": ["experiment","quantitative","statistics","confidence-intervals"],
    "pillar": "mathematics",
    "subtopic": "statistics"
  },
  {
    "id": "minimum_wage_employment",
    "title": "Does a minimum wage increase affect local employment rates?",
    "difficulty": "intermediate",
    "level": 15,
    "description": "Following a state-level minimum wage increase, you compare employment in the food service industry in the affected state vs. a neighbouring control state before and after the policy change.",
    "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
    "hints": ["You did not assign the wage increase — you observe its natural effects. What method applies?","Employment rate (%) measured over time is your numerical outcome.","Use difference-in-differences to control for pre-existing trends."],
    "tags": ["quasi-experiment","quantitative","economics","policy"],
    "pillar": "human_social",
    "subtopic": "economics"
  },
  {
    "id": "wing_angle_lift",
    "title": "Does wing angle of attack affect lift in a controlled wind tunnel?",
    "difficulty": "beginner",
    "level": 16,
    "description": "You hypothesise that increasing wing angle from 0 to 20 degrees in 5-degree increments increases lift up to a stall point. You have a small wind tunnel and force measurement equipment.",
    "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
    "hints": ["You set the angle directly using a protractor and mount — controlled experiment.","Lift force (Newtons) is a continuous numerical measurement.","Control for: airspeed, wing area, wing shape, air density and temperature."],
    "tags": ["experiment","quantitative","aerodynamics","fluid-dynamics"],
    "pillar": "engineering",
    "subtopic": "mechanical_aerospace"
  },
  {
    "id": "cache_size_cpu_performance",
    "title": "Does L1 cache size affect CPU benchmark performance?",
    "difficulty": "intermediate",
    "level": 17,
    "description": "You study how varying L1 cache sizes (32KB, 64KB, 128KB, 256KB) affect matrix multiplication benchmark performance using a CPU simulator.",
    "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
    "hints": ["You configure cache size directly in the simulator — controlled experiment.","Instructions per cycle (IPC) and execution time (ms) are your numerical outcomes.","Hold constant: clock frequency, memory latency, cache associativity, and benchmark code."],
    "tags": ["experiment","quantitative","computer-architecture","performance"],
    "pillar": "engineering",
    "subtopic": "electrical_computer"
  },
  {
    "id": "statistical_power_design",
    "title": "How does experimental design choice affect statistical power?",
    "difficulty": "intermediate",
    "level": 18,
    "description": "You compare statistical power of a between-subjects design vs. a within-subjects design for detecting a medium effect size (d=0.5) with a fixed total N=60 participants.",
    "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
    "hints": ["You choose the design type — assign participants to conditions or have each complete both.","Power (1-beta) calculated via simulation or power analysis tables is your outcome.","Control for: total N, effect size, significance level (alpha), number of conditions."],
    "tags": ["experiment","quantitative","statistics","power-analysis"],
    "pillar": "mathematics",
    "subtopic": "statistics"
  },
  {
    "id": "prime_gap_distribution",
    "title": "Is there a statistical pattern in the distribution of prime number gaps?",
    "difficulty": "intermediate",
    "level": 19,
    "description": "You computationally analyse gaps between consecutive primes up to 10 million and test whether the distribution follows Cramer's conjecture, comparing empirical frequencies to theoretical predictions.",
    "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
    "hints": ["You are observing existing mathematical properties with no manipulation possible.","Gap size (integer) and frequency per gap size are your measurements.","Use a chi-squared goodness-of-fit test to compare observed vs. predicted distributions."],
    "tags": ["observational","quantitative","number-theory","computational"],
    "pillar": "mathematics",
    "subtopic": "pure_math"
  },
  {
    "id": "meditation_cortisol",
    "title": "Does an 8-week mindfulness program reduce cortisol levels?",
    "difficulty": "intermediate",
    "level": 20,
    "description": "You test whether an 8-week MBSR (Mindfulness-Based Stress Reduction) program reduces salivary cortisol levels in university students during exam period. Participants randomised to MBSR or waitlist control.",
    "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
    "hints": ["Participants are randomly assigned to MBSR vs. waitlist — you control the intervention.","Salivary cortisol (nmol/L) via immunoassay is a biological numerical outcome.","Control for: baseline cortisol, sleep, exercise, caffeine, and exam schedule."],
    "tags": ["experiment","quantitative","psychology","cortisol","mindfulness"],
    "pillar": "science",
    "subtopic": "biology_organismal"
  },
]

existing_ids = {c['id'] for c in data['challenges']}
added = 0
for c in new_challenges:
    if c['id'] not in existing_ids:
        data['challenges'].append(c)
        added += 1

path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf-8')
print(f'Added {added} new challenges. Total: {len(data["challenges"])}')
