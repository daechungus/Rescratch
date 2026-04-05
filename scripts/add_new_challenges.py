"""Run once to append new hand-crafted challenges to data/challenges.json."""
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA_FILE = ROOT / "data" / "challenges.json"

NEW_CHALLENGES = [

# ═══════════════════════════════════════════════════════════════
# TECHNOLOGY  —  Machine Learning  (filling intermediate / advanced gap)
# ═══════════════════════════════════════════════════════════════

{
  "id": "dropout_regularization",
  "title": "Does dropout rate affect a neural network's tendency to overfit?",
  "difficulty": "intermediate",
  "level": 21,
  "description": "You want to determine whether increasing the dropout rate in a deep neural network reduces overfitting, measured as the gap between training and validation accuracy on CIFAR-10.",
  "brief": {
    "background": "Overfitting — when a model memorises training examples instead of learning general patterns — is one of the central challenges in supervised deep learning. Dropout is a widely-used stochastic regularisation technique: during each training step, each neuron is independently set to zero with probability p. This forces the network to distribute representations redundantly, preventing any single path from becoming dominant.\n\nDespite its near-universal adoption, the relationship between the dropout rate p and the training–validation accuracy gap is not trivially monotone. Too little dropout (p < 0.1) provides negligible regularisation; too much (p > 0.6) hinders learning entirely. Understanding where the sweet spot lies for a given architecture requires systematic experimentation.",
    "scenario": "You are a machine learning researcher at a university lab. You train a 6-layer CNN on CIFAR-10 under five dropout conditions: p ∈ {0, 0.1, 0.2, 0.4, 0.6}. All other hyperparameters — architecture width, learning rate, batch size, optimizer, and training epochs — are held constant. You run each condition with three random seeds and record training accuracy, validation accuracy, and their difference (the overfitting gap) at epoch 50.",
    "task": "Design a research methodology pipeline that isolates the dropout rate as the independent variable and measures its causal effect on the overfitting gap. Your pipeline must specify a directional hypothesis, define what is being measured and controlled, select the appropriate study method, describe how you collect outcome data, choose the right statistical analysis for comparing five conditions, and draw a valid conclusion.",
    "constraints": [
      "You are directly setting the dropout probability in code — this is active experimental manipulation, not observation.",
      "The overfitting gap (train accuracy − validation accuracy) is a continuous numeric measurement per run.",
      "You have five conditions — your analysis must be appropriate for comparing more than two groups.",
      "Control for: architecture, optimizer, learning rate, batch size, dataset splits, number of epochs, weight initialisation seed.",
      "Your conclusion must be proportional to what a single-dataset, single-architecture study can support."
    ],
    "input_format": "Five dropout rates × 3 random seeds × 50 epochs = 15 training runs. You record the final-epoch train accuracy, validation accuracy, and overfitting gap for each.",
    "expected_output": "A pipeline with a directional hypothesis, IV/DV/control variables, lab experiment method, medium-to-large sample, quantitative data collection, ANOVA for multi-group comparison, and a conclusion that supports or rejects the directional claim."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You set the dropout rate — that is direct manipulation. Which method block fits active experimental control?",
    "The overfitting gap is a number. You have 5 conditions. Which analysis handles multiple group means?",
    "Control for at least: learning rate, optimizer, architecture depth and width, random seed, dataset."
  ],
  "tags": ["experiment","quantitative","deep-learning","regularisation","overfitting"],
  "pillar": "technology",
  "subtopic": "machine_learning"
},

{
  "id": "transfer_learning_domain_shift",
  "title": "Does ImageNet pre-training improve accuracy when fine-tuning on medical chest X-rays?",
  "difficulty": "intermediate",
  "level": 22,
  "description": "You hypothesise that initialising a ResNet-50 with ImageNet weights leads to higher pneumonia detection accuracy on the NIH Chest X-ray dataset than random initialisation, even though the domains are very different.",
  "brief": {
    "background": "Transfer learning has become the dominant paradigm in computer vision: start with weights learned on a large general-purpose dataset (ImageNet), then fine-tune on a smaller target domain. The intuition is that early convolutional layers learn general edge and texture detectors that transfer across domains.\n\nBut medical imaging challenges this assumption. Chest X-rays are grayscale, have very different contrast statistics from natural photographs, and the discriminative features (subtle density differences, nodule shapes) bear little resemblance to ImageNet categories. Whether the inductive bias from natural-image pre-training helps or hurts on such a shifted domain is an open empirical question — and the answer has direct clinical implications.",
    "scenario": "You have access to the NIH Chest X-ray dataset (112,000 frontal-view X-rays, 14 pathology labels). You focus on binary pneumonia detection. You train ResNet-50 under two initialisation conditions: (A) random initialisation, (B) ImageNet pre-trained weights. All other training decisions — learning rate, batch size, class-balancing strategy, augmentation pipeline, optimizer, and early-stopping criterion — are held identical. You repeat each condition with four random seeds and report AUC-ROC at the end of training.",
    "task": "Design a research pipeline that tests whether pre-training source affects downstream classification performance. Define the IV (initialisation strategy) and DV (AUC-ROC on the held-out test set), choose the right study method, specify your sample, describe how you collect outcome data, select the correct statistical comparison for two conditions, and draw a conclusion.",
    "constraints": [
      "You directly choose the weight initialisation — this is active experimental manipulation.",
      "AUC-ROC is a continuous numeric metric — your data collection and analysis must suit quantitative outcomes.",
      "You have exactly two conditions — choose the analysis method appropriate for comparing two independent groups.",
      "Control for: architecture depth, all training hyperparameters, augmentation pipeline, class balancing, random seeds.",
      "Do not generalise beyond the specific dataset and architecture used."
    ],
    "input_format": "Two initialisation conditions × 4 random seeds = 8 training runs. Each run produces a final AUC-ROC on the held-out test set.",
    "expected_output": "Pipeline: directional hypothesis → IV/DV/control → lab experiment → medium sample → quantitative measurement data → t-test → supports/rejects conclusion."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "Two conditions, you control the setup — lab experiment with a t-test for two group means.",
    "AUC-ROC is a number. Use the data collection block that fits numerical, quantitative output.",
    "Control for everything except initialisation: same LR, same augmentation, same seeds structure."
  ],
  "tags": ["experiment","quantitative","computer-vision","transfer-learning","medical-imaging"],
  "pillar": "technology",
  "subtopic": "computer_vision"
},

{
  "id": "attention_head_pruning",
  "title": "Does structured pruning of attention heads degrade downstream task performance in BERT?",
  "difficulty": "advanced",
  "level": 23,
  "description": "You want to test whether progressively pruning a fixed percentage of the least-important attention heads in BERT-base leads to a statistically significant drop in F1 score on the SQuAD 1.1 reading comprehension benchmark.",
  "brief": {
    "background": "Transformer models dedicate a large fraction of their parameter budget to multi-head attention. Michel et al. (2019) showed that many attention heads can be removed at test time with surprisingly little accuracy loss, suggesting significant redundancy. Structured pruning — permanently removing entire heads rather than zeroing weights — offers real inference speedup on standard hardware.\n\nHowever, the relationship between the fraction of heads pruned and downstream task performance is non-linear and task-dependent. A study that systematically ablates head counts at multiple pruning levels while holding the fine-tuning procedure constant can characterise this trade-off precisely — knowledge essential for production deployment decisions.",
    "scenario": "You have BERT-base (12 layers × 12 heads = 144 heads total). You define five pruning levels: 0%, 10%, 25%, 50%, and 75% of heads removed using an importance score derived from attention entropy. After pruning, you fine-tune each variant on SQuAD 1.1 for 3 epochs with identical hyperparameters and measure Exact Match (EM) and F1 on the dev set. You repeat each condition with three fine-tuning seeds.",
    "task": "Design a research methodology that isolates pruning rate as the independent variable and measures its effect on downstream F1. The design must specify an appropriate hypothesis, define IV/DV/control variables, choose the study method, describe data collection, select the right multi-group analysis, and draw a conclusion that accounts for the breadth of conditions tested.",
    "constraints": [
      "Pruning rate is directly set by you — active experimental manipulation.",
      "F1 and EM are continuous numeric metrics. Use quantitative data collection.",
      "Five pruning levels require a multi-group comparison method — not a simple t-test.",
      "Control for: base model weights, fine-tuning LR, batch size, number of epochs, random seeds for fine-tuning.",
      "An ablation study is the appropriate methodological category here — not a survey or observational study."
    ],
    "input_format": "5 pruning levels × 3 seeds × SQuAD dev set evaluation = 15 fine-tuning runs. Each produces a final F1 and EM score.",
    "expected_output": "Ablation study design: directional/nondirectional hypothesis → IV (pruning %) / DV (F1) / controls → method_ablation → large sample → quantitative data → ANOVA → conclusion."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You're systematically removing components of a model to measure their effect — that's an ablation study.",
    "Five conditions, each with multiple runs — ANOVA is the right multi-group comparison.",
    "Control for: base model weights, fine-tuning hyperparameters, evaluation split."
  ],
  "tags": ["ablation","quantitative","NLP","transformers","pruning","efficiency"],
  "pillar": "technology",
  "subtopic": "nlp"
},

{
  "id": "knowledge_distillation_compression",
  "title": "Does the teacher–student size ratio predict accuracy retention in knowledge distillation?",
  "difficulty": "advanced",
  "level": 24,
  "description": "You hypothesise that larger teacher-to-student size ratios result in lower accuracy retention after distillation. You test this across four teacher–student pairings on CIFAR-100.",
  "brief": {
    "background": "Knowledge distillation trains a compact 'student' network to match the soft probability outputs of a large pre-trained 'teacher'. The student learns from the teacher's dark knowledge — the relative probabilities assigned to non-target classes carry richer information than hard labels alone.\n\nA fundamental open question is whether the capacity gap between teacher and student limits distillation quality. If the student is too small to absorb the teacher's knowledge, accuracy retention may drop sharply. Empirically mapping this relationship across multiple size ratios, while controlling for training protocol, can answer how aggressively practitioners can compress a given model.",
    "scenario": "You train four student networks of increasing capacity on CIFAR-100, each distilled from the same ResNet-110 teacher (1.7M parameters). Student sizes: 0.1M, 0.3M, 0.6M, 1.0M parameters. You measure accuracy retention = (student acc after distillation) / (teacher acc). All distillation hyperparameters — temperature T=4, α=0.9 weighting, optimizer, LR schedule — are held identical. Three random seeds per condition.",
    "task": "Design a research pipeline that tests whether teacher-student size ratio predicts accuracy retention. Define the IV (size ratio), DV (accuracy retention), control variables, choose the appropriate study method, specify sample size, select the right analysis for a continuous IV (size ratio as a numeric predictor), and draw conclusions about the relationship.",
    "constraints": [
      "Size ratio is a continuous numeric variable you control — this is experimental manipulation.",
      "Accuracy retention is a continuous numeric outcome. Use quantitative measurement.",
      "With a continuous IV predicting a continuous DV, consider which analysis captures a linear or non-linear relationship better than ANOVA.",
      "Control for: teacher architecture and weights, distillation temperature, loss weighting α, optimizer, LR schedule, dataset splits.",
      "Four data points may be insufficient to establish a robust trend — acknowledge the limitation in your conclusion."
    ],
    "input_format": "4 student sizes × 3 seeds = 12 distillation runs. Each yields a final CIFAR-100 test accuracy. Teacher accuracy is fixed at 73.2%.",
    "expected_output": "Lab experiment with regression analysis to capture the continuous IV→DV relationship. Hypothesis should be directional (larger ratio → lower retention). Include control_variable block."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You control student size — active experimental manipulation → lab experiment.",
    "When both IV and DV are continuous numbers and you want to model the relationship, regression is more informative than ANOVA.",
    "Accuracy retention is a computed ratio — data_measurement fits quantitative numeric output."
  ],
  "tags": ["experiment","quantitative","deep-learning","knowledge-distillation","compression","efficiency"],
  "pillar": "technology",
  "subtopic": "machine_learning"
},

{
  "id": "lr_warmup_transformer_stability",
  "title": "Does learning rate warm-up length affect training stability in vision transformers?",
  "difficulty": "advanced",
  "level": 25,
  "description": "You want to test whether the number of warm-up epochs in a cosine LR schedule affects training stability (measured as loss variance during the first 20 epochs) when training a ViT-Small from scratch on ImageNet-100.",
  "brief": {
    "background": "Vision Transformers (ViTs) trained from scratch are notoriously sensitive to the learning rate schedule, particularly in the early phases of training. Unlike CNNs with built-in inductive biases, ViTs rely on attention mechanisms that can produce unstable gradient flows when the learning rate is too high from the first step.\n\nLearning rate warm-up — starting from a near-zero LR and linearly increasing to the peak over N epochs before applying cosine decay — is a standard remedy. Yet the optimal warm-up length varies with architecture scale, dataset size, and batch size. A systematic study that holds everything constant except warm-up length can precisely quantify this sensitivity.",
    "scenario": "You train ViT-Small (21M params) on ImageNet-100 (130K images, 100 classes) using AdamW with cosine decay, batch size 512, peak LR 1e-3, for 100 epochs total. You test five warm-up lengths: 0, 5, 10, 20, and 40 epochs. You record training loss at every epoch and compute the variance of the loss trajectory in epochs 1–20 as the stability metric. You also record final top-1 validation accuracy. Three seeds per condition.",
    "task": "Design a methodology pipeline that isolates warm-up length as the IV and measures training stability as the primary DV. The design must account for multiple conditions, use the right analysis method for comparing variances across groups, and draw a conclusion about whether warm-up length has a significant effect on early-training stability.",
    "constraints": [
      "Warm-up length is set directly in your training config — active experimental manipulation.",
      "Both loss variance and final accuracy are numeric metrics — use quantitative data collection.",
      "Five conditions × 3 seeds: use a multi-group comparison that can detect differences across means.",
      "Control for: architecture, optimizer, peak LR, batch size, dataset, augmentation pipeline, total epochs.",
      "Loss variance and accuracy are two separate outcomes — you may need to interpret them together in your conclusion."
    ],
    "input_format": "5 warm-up lengths × 3 seeds = 15 training runs × 100 epochs. You record per-epoch loss and final val accuracy.",
    "expected_output": "Lab experiment → ANOVA on loss variance across warm-up groups → conclusion about whether warm-up significantly affects stability."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "Warm-up length is directly set by you — lab experiment.",
    "Five warm-up lengths means five groups — ANOVA, not t-test.",
    "Both loss variance and accuracy are numerical — data_measurement fits."
  ],
  "tags": ["experiment","quantitative","computer-vision","transformers","training-dynamics","deep-learning"],
  "pillar": "technology",
  "subtopic": "computer_vision"
},

# ═══════════════════════════════════════════════════════════════
# TECHNOLOGY  —  Broken Lab
# ═══════════════════════════════════════════════════════════════

{
  "id": "broken_lab_survey_ml_experiment",
  "type": "broken_lab",
  "title": "Broken: measuring augmentation effect with a survey",
  "difficulty": "intermediate",
  "level": 26,
  "description": "A student designed a study to measure the effect of data augmentation on image classifier accuracy — but used a survey method and qualitative thematic analysis instead of a controlled experiment with quantitative metrics. Find and fix all the methodological errors.",
  "brief": {
    "background": "This pipeline was built to test whether data augmentation improves CNN test accuracy — a quantitative, controlled question. The student chose a survey to gather opinions about augmentation and used thematic analysis to interpret open-ended responses. There are at least four serious errors.",
    "scenario": "Review the pre-built pipeline. Identify every block that is wrong for this research question. Replace incorrect blocks with appropriate ones and re-wire the connections.",
    "task": "Fix the pipeline so it correctly describes a controlled lab experiment measuring the quantitative effect of data augmentation on CNN test accuracy. The corrected pipeline should use: a directional hypothesis, IV + DV + control variable, lab experiment method, adequate sample, quantitative data collection, and an analysis appropriate for comparing two group means.",
    "constraints": [
      "The research question is quantitative — opinions and Likert scales are not valid outcome measures here.",
      "There are exactly two conditions (augmentation on / off) — the analysis block must match.",
      "A survey studies human attitudes, not machine learning model performance.",
      "You must add a control variable block — the current pipeline omits it entirely."
    ],
    "input_format": "Pre-filled broken pipeline with 4 errors: wrong method (survey), wrong sample (small), wrong data (Likert), wrong analysis (thematic).",
    "expected_output": "Fixed pipeline: hypothesis_directional → independent_variable + dependent_variable + control_variable → method_experiment_lab → sample_medium → data_measurement → analysis_t_test → conclusion_supports or rejects."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You're measuring model accuracy (a number) — which data collection block suits numeric, quantitative output?",
    "A survey asks people questions. A lab experiment manipulates a variable and measures an outcome. Which fits here?",
    "With two conditions and a numeric outcome, which analysis block compares two group means?"
  ],
  "tags": ["broken-lab","debugging","experiment","quantitative","deep-learning"],
  "pillar": "technology",
  "subtopic": "machine_learning",
  "broken_canvas": {
    "blocks": [
      {"instanceId": "b1", "blockDefId": "hypothesis_nondirectional", "x": 60,  "y": 100},
      {"instanceId": "b2", "blockDefId": "independent_variable",      "x": 260, "y": 60},
      {"instanceId": "b3", "blockDefId": "dependent_variable",         "x": 260, "y": 180},
      {"instanceId": "b4", "blockDefId": "method_survey",              "x": 460, "y": 100},
      {"instanceId": "b5", "blockDefId": "sample_small",               "x": 660, "y": 60},
      {"instanceId": "b6", "blockDefId": "sampling_convenience",       "x": 660, "y": 180},
      {"instanceId": "b7", "blockDefId": "data_likert",                "x": 860, "y": 100},
      {"instanceId": "b8", "blockDefId": "analysis_thematic",          "x": 1060,"y": 100},
      {"instanceId": "b9", "blockDefId": "conclusion_supports",        "x": 1260,"y": 100}
    ],
    "connections": [
      {"id": "c1", "fromInstanceId": "b1", "toInstanceId": "b2"},
      {"id": "c2", "fromInstanceId": "b1", "toInstanceId": "b3"},
      {"id": "c3", "fromInstanceId": "b2", "toInstanceId": "b4"},
      {"id": "c4", "fromInstanceId": "b3", "toInstanceId": "b4"},
      {"id": "c5", "fromInstanceId": "b4", "toInstanceId": "b5"},
      {"id": "c6", "fromInstanceId": "b5", "toInstanceId": "b7"},
      {"id": "c7", "fromInstanceId": "b6", "toInstanceId": "b7"},
      {"id": "c8", "fromInstanceId": "b7", "toInstanceId": "b8"},
      {"id": "c9", "fromInstanceId": "b8", "toInstanceId": "b9"}
    ]
  }
},

# ═══════════════════════════════════════════════════════════════
# SCIENCE  —  Biology / Chemistry
# ═══════════════════════════════════════════════════════════════

{
  "id": "antibiotic_submic_resistance",
  "title": "Does sub-inhibitory antibiotic concentration accelerate resistance mutation emergence?",
  "difficulty": "intermediate",
  "level": 27,
  "description": "You want to test whether exposing E. coli cultures to sub-minimum inhibitory concentrations (sub-MIC) of ampicillin leads to a higher frequency of resistance mutations compared to unexposed controls, as measured by colony counts on antibiotic-selective plates.",
  "brief": {
    "background": "Antibiotic resistance is one of the most pressing public health crises of the 21st century. While resistance emerges inevitably under full therapeutic doses, a growing body of literature suggests that sub-inhibitory concentrations — doses too low to kill bacteria but high enough to impose selective pressure — may be particularly potent drivers of resistance evolution. At sub-MIC, bacteria survive but experience elevated stress responses including SOS-induced mutagenesis, potentially accelerating mutation rates without lethal selection against the host population.",
    "scenario": "You are a microbiologist studying antibiotic resistance emergence. You culture E. coli K-12 at 37°C in LB broth under three conditions: (A) no ampicillin, (B) 0.25× MIC ampicillin, (C) 0.5× MIC ampicillin. After 24 hours of growth, you plate 100 µL aliquots on LB-ampicillin agar (at 2× MIC) and count resistant colonies after 48 hours of incubation. You run five biological replicates per condition.",
    "task": "Design a research methodology pipeline that tests whether sub-MIC antibiotic exposure increases resistance emergence frequency. Define your hypothesis, IV, DV, and the critical control variables, choose the appropriate wet lab method, specify your sample, describe how you collect count data, select the right analysis for comparing three group means, and draw a valid conclusion.",
    "constraints": [
      "You directly set the ampicillin concentration in the growth medium — active experimental manipulation.",
      "Resistant colony counts are discrete numeric data — use a data collection block suited to counting.",
      "Three conditions require an analysis method appropriate for comparing more than two groups.",
      "Critical controls: incubation time, temperature, initial inoculum density, medium batch, plating volume.",
      "Your conclusion must acknowledge that elevated mutation rate is inferred from colony counts, not directly measured at the DNA level."
    ],
    "input_format": "3 ampicillin conditions × 5 biological replicates = 15 plates. Each plate yields a resistant colony count at 48h.",
    "expected_output": "Wet lab experiment: directional hypothesis → IV (ampicillin concentration) / DV (colony count) / controls → method_wet_lab → medium sample → data_count → analysis_anova → supports/rejects."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You set the ampicillin concentration in the culture medium — that's direct manipulation → wet lab experiment.",
    "Colony counts are discrete numbers — data_count is the right data collection block.",
    "Three conditions (no drug, 0.25× MIC, 0.5× MIC) → ANOVA, not t-test."
  ],
  "tags": ["experiment","quantitative","microbiology","antibiotic-resistance","wet-lab"],
  "pillar": "science",
  "subtopic": "biology_molecular"
},

{
  "id": "enzyme_substrate_kinetics",
  "title": "Does substrate concentration follow Michaelis–Menten kinetics in lactase activity?",
  "difficulty": "intermediate",
  "level": 28,
  "description": "You want to experimentally verify the Michaelis–Menten model by measuring lactase reaction velocity at eight substrate (lactose) concentrations and fitting the data to determine Km and Vmax.",
  "brief": {
    "background": "Michaelis–Menten kinetics describes the relationship between substrate concentration [S] and reaction velocity v for enzyme-catalysed reactions. At low [S], velocity increases roughly linearly; as [S] approaches and exceeds the Michaelis constant Km, velocity plateaus toward the maximum rate Vmax. Two parameters — Km (substrate affinity) and Vmax (catalytic capacity) — fully characterise the enzyme under fixed temperature and pH conditions.\n\nLactase cleaves lactose into glucose and galactose. It is commercially significant (lactose intolerance treatments) and extensively characterised, making it an ideal model enzyme for kinetic studies. However, fitting the Michaelis–Menten curve correctly requires choosing substrate concentrations that span both the linear and saturating regions of the curve.",
    "scenario": "You work in a biochemistry teaching lab. You have purified lactase at a fixed enzyme concentration. You prepare eight substrate concentrations: 0.5, 1, 2, 4, 8, 16, 32, and 64 mM lactose in pH 6.5 phosphate buffer at 37°C. You measure initial reaction velocity by tracking glucose release using a glucose oxidase colorimetric assay (absorbance at 540 nm) over the first 60 seconds. Each concentration is run in triplicate.",
    "task": "Design a research methodology that tests whether lactase follows Michaelis–Menten kinetics. Specify the hypothesis (does velocity depend on substrate concentration in a saturating, non-linear way?), define IV and DV, choose the right lab method, describe data collection, select the analysis appropriate for fitting a non-linear curve to characterise the relationship, and draw a conclusion about whether the data support the model.",
    "constraints": [
      "Substrate concentration is directly prepared by you — active experimental manipulation.",
      "Reaction velocity (µmol/min/mg enzyme) is a continuous numeric measurement from spectroscopic data.",
      "You are fitting a model to the IV-DV relationship — regression (non-linear) is the appropriate analysis.",
      "Controls: enzyme concentration, temperature, pH, buffer composition, assay reagent batch.",
      "Triplicate measurements provide error estimates — your analysis should account for measurement variance."
    ],
    "input_format": "8 substrate concentrations × 3 replicates = 24 assay wells. Each produces an absorbance time-course from which initial velocity is calculated.",
    "expected_output": "Wet lab → regression analysis to fit Michaelis–Menten curve → conclusion about whether the data conform to the model."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You prepare each substrate concentration yourself — wet lab experiment.",
    "You're measuring absorbance (a number) — data_measurement or data_spectroscopy.",
    "You want to fit a curve describing the IV-DV relationship — regression is the right analysis."
  ],
  "tags": ["experiment","quantitative","biochemistry","enzymology","kinetics","wet-lab"],
  "pillar": "science",
  "subtopic": "chemistry_organic"
},

{
  "id": "crispr_guide_rna_efficiency",
  "title": "Does guide RNA GC content predict CRISPR-Cas9 editing efficiency in human HEK293 cells?",
  "difficulty": "advanced",
  "level": 29,
  "description": "You want to determine whether guide RNA GC content (30–70%) is a significant predictor of on-target editing efficiency (measured as % of alleles edited by T7E1 assay) in HEK293 cells, controlling for secondary structure and off-target score.",
  "brief": {
    "background": "CRISPR-Cas9 genome editing begins with a 20-nucleotide guide RNA (gRNA) that directs the Cas9 endonuclease to a complementary DNA target. Editing efficiency varies dramatically across gRNAs targeting the same locus. Computational tools like Rule Set 2 and DeepCRISPR attempt to predict efficiency from sequence features, but the relative importance of individual features — including GC content — remains debated.\n\nGC content influences gRNA stability, melting temperature, and propensity to form secondary structures that occlude the 3′ seed region. Studies suggest a U-shaped relationship: both very low (< 30%) and very high (> 70%) GC content correlate with poor efficiency. Understanding this relationship empirically, rather than relying solely on computational predictions, is essential for designing reliable editing experiments.",
    "scenario": "You design 24 gRNAs targeting the HPRT1 safe-harbour locus in HEK293 cells, spanning GC contents from 30% to 70% in 5% increments (4 gRNAs per GC-content bracket). You transfect each gRNA individually with Cas9-RNP, harvest cells at 72h, extract genomic DNA, and run T7E1 cleavage assay followed by gel densitometry to estimate indel frequency. You also record each gRNA's predicted off-target score (Doench et al.) and secondary structure MFE to use as covariates.",
    "task": "Design a research pipeline that tests whether GC content predicts editing efficiency while controlling for off-target score and secondary structure. Specify a directional hypothesis, IV (GC content), DV (editing efficiency), confounding variables, choose the appropriate in vitro method, describe data collection, select the analysis that handles a continuous IV with covariates, and draw a valid conclusion.",
    "constraints": [
      "GC content is set by your gRNA design — you directly control it (active manipulation).",
      "Editing efficiency (% indels) is a continuous numeric proportion — use quantitative measurement.",
      "Off-target score and secondary structure MFE act as confounding variables — they must be included in your study design.",
      "With a continuous IV predicting a continuous DV and covariates, regression is more appropriate than ANOVA.",
      "24 gRNAs provide limited power — acknowledge uncertainty in your conclusion."
    ],
    "input_format": "24 gRNAs × 1 transfection condition = 24 data points. Each yields an indel frequency (0–100%), off-target score, and MFE value.",
    "expected_output": "In vitro experiment → regression with confounding variables → directional conclusion about GC content effect direction and magnitude."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You design and test each gRNA yourself — in vitro wet lab experiment.",
    "Editing efficiency (% indels) is a continuous number — data_measurement.",
    "Continuous IV predicting continuous DV with covariates → regression analysis."
  ],
  "tags": ["experiment","quantitative","molecular-biology","CRISPR","genomics","wet-lab"],
  "pillar": "science",
  "subtopic": "biology_molecular"
},

# ═══════════════════════════════════════════════════════════════
# SCIENCE  —  Physics
# ═══════════════════════════════════════════════════════════════

{
  "id": "air_resistance_terminal_velocity",
  "title": "Does object cross-sectional area affect terminal velocity in free fall?",
  "difficulty": "beginner",
  "level": 30,
  "description": "You want to measure whether increasing the cross-sectional area of paper discs dropped from a fixed height results in lower terminal velocity, as predicted by the drag force equation Fd = ½ρCdAv².",
  "brief": {
    "background": "When an object falls through air, gravity accelerates it downward while air resistance (drag) acts upward. Drag force increases with the square of velocity and with the object's cross-sectional area — so larger objects reach terminal velocity (where drag equals gravity) at lower speeds.\n\nThis relationship is fundamental to aerospace engineering, biology (how seeds fall), and sports science (parachute design). Testing it with paper discs of identical mass but different radii lets you isolate cross-sectional area as the single variable — a clean example of controlled experimentation.",
    "scenario": "You cut circular paper discs in five sizes: radius 2, 3, 4, 5, and 6 cm. Each disc has the same paper weight per unit area (80 g/m²), so larger discs have proportionally more mass but the same density. You drop each disc 15 times from a height of 2.5 m and record fall time with a stopwatch. You calculate average fall time and estimate terminal velocity from fall time and distance. You repeat with 5 discs of each size.",
    "task": "Design a research methodology that tests whether cross-sectional area affects terminal velocity. Specify a directional hypothesis, define the IV, DV, and control variables, choose the lab method, describe how you collect time measurements, select the appropriate multi-group comparison analysis, and draw a valid conclusion.",
    "constraints": [
      "You directly cut and choose the disc radius — active experimental manipulation.",
      "Fall time and calculated velocity are numeric measurements.",
      "Five disc sizes → analysis for comparing more than two group means.",
      "Controls: drop height, paper density, room air currents, release technique, disc flatness.",
      "Terminal velocity is estimated, not directly measured — account for this approximation in your conclusion."
    ],
    "input_format": "5 disc sizes × 15 drops = 75 fall-time measurements. You calculate mean velocity per size class.",
    "expected_output": "Lab experiment: directional hypothesis → IV (area) / DV (velocity) / controls → method_experiment_lab → medium sample → data_measurement → analysis_anova → conclusion."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You control the disc size — lab experiment.",
    "Fall time is a number — data_measurement.",
    "Five sizes, comparing means — ANOVA."
  ],
  "tags": ["experiment","quantitative","physics","fluid-dynamics","drag"],
  "pillar": "science",
  "subtopic": "physics_applied"
},

{
  "id": "concentration_conductivity",
  "title": "Does electrolyte concentration affect electrical conductivity of aqueous solutions?",
  "difficulty": "beginner",
  "level": 31,
  "description": "You want to measure the relationship between NaCl concentration (0.1–2.0 mol/L) and the electrical conductivity (mS/cm) of aqueous solutions at room temperature, using a conductivity probe.",
  "brief": {
    "background": "Electrical conductivity in aqueous solutions arises from the movement of dissolved ions. For strong electrolytes like sodium chloride (NaCl), increasing concentration increases the number of charge carriers — up to a point. At high concentrations, ion–ion interactions begin to reduce mobility, causing conductivity to plateau or even decrease (the Kohlrausch effect).\n\nUnderstanding this relationship is fundamental to electrochemistry, water quality analysis, and the design of electrolyte solutions for batteries and biological experiments. A simple concentration–conductivity experiment teaches controlled measurement, curve fitting, and the limits of linear approximations.",
    "scenario": "You prepare eight NaCl solutions: 0.1, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, and 2.0 mol/L in deionised water. All solutions are prepared at 22°C ± 0.5°C. You measure conductivity with a calibrated probe three times per solution and record the mean. You also prepare a blank (pure deionised water) as a baseline.",
    "task": "Design a research methodology that tests whether NaCl concentration predicts electrical conductivity. Specify a directional hypothesis, define IV and DV, choose the correct wet lab method, describe data collection, select the analysis that models the IV→DV relationship (hint: it's continuous-to-continuous), and draw a conclusion about whether the data follow a linear or non-linear trend.",
    "constraints": [
      "You prepare each concentration yourself — active manipulation.",
      "Conductivity (mS/cm) is a continuous numeric measurement.",
      "You have 8 concentrations as a continuous IV — regression captures the relationship better than ANOVA.",
      "Controls: water purity (deionised), temperature, probe calibration, container cleanliness.",
      "At high concentrations, the relationship may become non-linear — your conclusion should address this."
    ],
    "input_format": "8 concentrations × 3 measurements = 24 conductivity readings. Mean conductivity per concentration is your outcome variable.",
    "expected_output": "Wet lab → regression analysis → conclusion about whether the relationship is linear or shows saturation."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You prepare each NaCl concentration yourself — wet lab.",
    "Conductivity is measured as a number — data_measurement.",
    "Continuous IV (concentration) → continuous DV (conductivity) → regression."
  ],
  "tags": ["experiment","quantitative","chemistry","electrochemistry","wet-lab"],
  "pillar": "science",
  "subtopic": "chemistry_organic"
},

# ═══════════════════════════════════════════════════════════════
# PSYCHOLOGY  —  filling intermediate / advanced
# ═══════════════════════════════════════════════════════════════

{
  "id": "spacing_effect_retention",
  "title": "Does spaced practice improve long-term retention compared to massed practice?",
  "difficulty": "beginner",
  "level": 32,
  "description": "You want to test whether studying 20 vocabulary pairs across four spaced sessions (one per day) leads to higher recall after one week compared to studying the same pairs in one massed two-hour session.",
  "brief": {
    "background": "The spacing effect — the finding that distributing practice over time leads to better long-term retention than concentrating the same amount of practice in a single session — is one of the most replicable results in cognitive psychology. Ebbinghaus documented it in 1885, and it has been replicated across materials, ages, and timescales.\n\nDespite its robust empirical basis, the spacing effect is routinely ignored in education practice: students tend to cram before exams rather than distribute study. Understanding the mechanism (interleaved forgetting triggering retrieval practice) and magnitude of the effect helps educators design evidence-based curricula.",
    "scenario": "You recruit 40 undergraduate volunteers. Participants are randomly assigned to one of two conditions: (A) massed — study 20 English–Swahili word pairs for 2 hours in a single session; (B) spaced — study the same 20 pairs for 30 minutes per day across 4 consecutive days. Both groups take a written recall test one week after their final study session. You record the number of correct translations (0–20) for each participant.",
    "task": "Design a research methodology pipeline that tests whether practice schedule affects retention. Specify a directional hypothesis, define the IV (massed vs spaced), DV (recall score), and control variables, choose the appropriate method, describe how you collect outcome data, select the correct two-group analysis, and draw a conclusion.",
    "constraints": [
      "You randomly assign participants to conditions — this is an active intervention, not observation.",
      "Recall score is a whole number (0–20 correct) — use quantitative data collection.",
      "Two conditions (massed vs spaced) → t-test or equivalent two-group comparison.",
      "Controls: total study time (equal for both groups), word pair set, test format, delay between last study and test.",
      "Random assignment is essential — use random sampling to avoid selection bias."
    ],
    "input_format": "40 participants × 1 retention test = 40 recall scores (0–20). 20 per condition.",
    "expected_output": "RCT or lab experiment: directional hypothesis → IV / DV / control → method_rct or experiment_lab → random sampling → sample_medium → data_measurement → analysis_t_test → conclusion."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You randomly assign participants and manipulate practice schedule — RCT or lab experiment.",
    "Recall score is a count (0–20) but treated as continuous — data_measurement or data_count.",
    "Two conditions → t-test."
  ],
  "tags": ["experiment","quantitative","psychology","memory","learning","education"],
  "pillar": "human_social",
  "subtopic": "psychology"
},

{
  "id": "cognitive_load_working_memory",
  "title": "Does background noise level reduce working memory capacity on a digit span task?",
  "difficulty": "intermediate",
  "level": 33,
  "description": "You hypothesise that increasing background noise (0, 60, and 80 dB) during a digit span task progressively reduces the number of digits recalled correctly, as noise imposes additional cognitive load.",
  "brief": {
    "background": "Working memory — the cognitive system that temporarily holds and manipulates information — has a limited capacity, classically estimated at 7 ± 2 items by Miller (1956). Cognitive load theory posits that any competing demand on working memory resources reduces the capacity available for the primary task.\n\nBackground noise, particularly irrelevant speech, is a well-documented source of cognitive interference. The Irrelevant Sound Effect (ISE) shows that unattended spoken material impairs serial recall even when participants are told to ignore it. Whether this effect scales with noise intensity (dB) or is specifically tied to speech content remains an active research question.",
    "scenario": "You recruit 60 participants (20 per condition). Each participant completes a forward digit span task: they hear sequences of digits of increasing length and must recall them in order. You test three noise conditions: (A) silence (0 dB ambient), (B) 60 dB white noise, (C) 80 dB white noise. Participants are tested in a sound-attenuated booth. Each participant is randomly assigned to one noise condition. The digit span score is the maximum sequence length recalled correctly on two of three trials.",
    "task": "Design a research methodology that tests whether noise level affects digit span. Define the IV (noise level), DV (digit span score), and control variables, choose the appropriate method, specify the sample, collect numeric outcome data, select the correct multi-group analysis, and draw a conclusion about whether the noise effect scales with intensity.",
    "constraints": [
      "Noise level is directly set by you via calibrated speaker — active experimental manipulation.",
      "Digit span score is a discrete integer — treated as a continuous numeric outcome.",
      "Three conditions (silence, 60 dB, 80 dB) → analysis for comparing more than two group means.",
      "Controls: time of day, participant fatigue level, headphone model, digit presentation rate, practice trials.",
      "Random assignment to conditions prevents self-selection bias."
    ],
    "input_format": "60 participants × 3 conditions (between-subjects) = 20 per condition. Each participant produces one digit span score.",
    "expected_output": "Lab experiment: directional hypothesis → IV / DV / control → experiment_lab → random sampling → sample_medium → data_measurement → analysis_anova → conclusion."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You set the noise level in the testing booth — lab experiment.",
    "Digit span score is a number — data_measurement.",
    "Three noise levels → ANOVA."
  ],
  "tags": ["experiment","quantitative","psychology","cognitive-load","working-memory","noise"],
  "pillar": "human_social",
  "subtopic": "psychology"
},

{
  "id": "anchoring_bias_price_estimation",
  "title": "Does an initial anchor value shift participants' estimates of an unfamiliar product's price?",
  "difficulty": "intermediate",
  "level": 34,
  "description": "You want to test whether presenting a high, neutral, or low anchor price before asking participants to estimate the fair value of an unfamiliar product (a rare kitchen gadget) shifts their estimates in the direction of the anchor.",
  "brief": {
    "background": "The anchoring-and-adjustment heuristic, documented by Tversky and Kahneman (1974), describes the tendency for people to rely heavily on an initial piece of information (the 'anchor') when making subsequent numerical judgements. Even when the anchor is explicitly random or irrelevant, it biases estimates toward the anchor value.\n\nAnchoring affects price negotiations, legal sentencing, and medical diagnosis. Understanding its magnitude in a controlled setting — and whether it is symmetric (high anchor → high estimate, low anchor → low estimate) — has important implications for consumer behaviour research and policy design.",
    "scenario": "You recruit 90 participants via an online platform, randomly assigning 30 to each of three anchor conditions. Participants are shown a photo and brief description of a premium ceramic knife sharpener, then told: (A) 'This product is sometimes sold for £8. What do you think is a fair price?' (low anchor); (B) 'What do you think is a fair price?' (no anchor); (C) 'This product is sometimes sold for £120. What do you think is a fair price?' (high anchor). Participants enter a number in a text box. You record the stated price estimate for each participant.",
    "task": "Design a research pipeline that tests the anchoring effect on price estimates. Define the IV (anchor condition), DV (price estimate in £), and control variables. Choose the appropriate experimental method, specify the sampling strategy, describe how you collect numeric estimates, select the right multi-group analysis, and draw a conclusion about whether the anchor significantly shifts estimates.",
    "constraints": [
      "You randomly assign participants to anchor conditions — active experimental manipulation.",
      "Price estimate is a continuous numeric value entered by the participant.",
      "Three conditions → ANOVA or equivalent multi-group comparison.",
      "Controls: product description, image quality, participant numeracy, time allowed to respond.",
      "Random assignment is essential to prevent systematic differences between groups."
    ],
    "input_format": "90 participants × 3 conditions (between-subjects) = 30 per cell. Each participant provides one price estimate in £.",
    "expected_output": "Lab experiment or RCT with random assignment → ANOVA → conclusion about whether anchor direction shifts mean estimates."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "Random assignment + experimental manipulation → RCT or lab experiment.",
    "Price estimate is a number — data_measurement.",
    "Three anchor conditions → ANOVA."
  ],
  "tags": ["experiment","quantitative","psychology","behavioural-economics","anchoring","decision-making"],
  "pillar": "human_social",
  "subtopic": "psychology"
},

{
  "id": "stereotype_threat_math_performance",
  "title": "Does stereotype threat reduce maths test performance in women under diagnostic framing?",
  "difficulty": "advanced",
  "level": 35,
  "description": "Replicating Steele & Aronson (1995) in a maths domain: you test whether women who are told a maths test 'shows gender differences' score lower than women told it 'shows no gender differences', and whether this effect is moderated by maths identification.",
  "brief": {
    "background": "Stereotype threat — the situational predicament of being at risk of confirming a negative stereotype about one's social group — is one of the most studied phenomena in social psychology. Steele and Aronson demonstrated that reminding Black students of their racial identity before a verbal test significantly reduced their performance. The mechanism is thought to involve increased cognitive monitoring and working memory depletion under the stress of potentially confirming the stereotype.\n\nIn mathematics, women face a well-known stereotype ('women are worse at maths') that can be activated by situational cues. The Steele & Aronson paradigm predicts that women in a 'diagnostic' framing — where the test ostensibly measures mathematical ability — will underperform relative to a non-diagnostic condition, particularly those who strongly identify with maths as part of their identity.",
    "scenario": "You recruit 80 women undergraduates who have completed at least two university-level maths courses. Participants complete a 20-item advanced maths test (GRE-level) under one of two framing conditions: (A) threat — 'This test measures mathematical reasoning ability and has shown gender differences in the past'; (B) control — 'This test is a problem-solving exercise that has shown no gender differences.' Before the test, all participants complete the Maths Identification Scale (6 items, 1–7 Likert). You record test score (0–20) and maths identification score.",
    "task": "Design a research pipeline that tests both the main effect of stereotype threat on performance AND whether maths identification moderates this effect. Specify a directional hypothesis for both main effect and moderation, define IV (framing condition), DV (test score), moderator (identification), and control variables. Choose the appropriate method, describe data collection, select the analysis that can test both main effects and interactions, and draw conclusions about both effects.",
    "constraints": [
      "You randomly assign participants to framing conditions — this is experimental manipulation.",
      "Test score (0–20) and identification score (6–42) are both numeric — quantitative data collection.",
      "Testing a main effect and moderation requires an analysis method capable of handling interaction terms — regression with an interaction term, or ANOVA with a covariate.",
      "Controls: maths test difficulty, identical instructions, time limit, proctor behaviour, room conditions.",
      "Ethical review required: participants must be debriefed about the stereotype threat manipulation."
    ],
    "input_format": "80 women × 2 conditions (40 per condition). Each participant: test score (0–20) + identification score + condition assignment.",
    "expected_output": "RCT: directional hypothesis (threat → lower score; high ID moderates) → IV + DV + confounding_variable → method_rct → random + stratified sampling → data_measurement → analysis_regression → nuanced conclusion."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "Random assignment + framing manipulation → RCT.",
    "You want to test both a main effect and a moderation (interaction) — regression with interaction term handles this better than a basic t-test.",
    "Add maths identification as a confounding or moderator variable in your design."
  ],
  "tags": ["experiment","quantitative","psychology","social-psychology","stereotype-threat","gender","moderation"],
  "pillar": "human_social",
  "subtopic": "psychology"
},

# ═══════════════════════════════════════════════════════════════
# HUMAN/SOCIAL  —  Sociology / Economics
# ═══════════════════════════════════════════════════════════════

{
  "id": "social_proof_recycling_behaviour",
  "title": "Does descriptive social proof messaging increase recycling compliance in student halls?",
  "difficulty": "intermediate",
  "level": 36,
  "description": "You want to test whether posting signs with descriptive norms ('80% of students in this hall recycled correctly last week') near recycling bins increases the recycling compliance rate compared to signs with general environmental appeals or no signs.",
  "brief": {
    "background": "Descriptive social norms — information about what most people actually do — are a potent behaviour-change tool. Cialdini et al.'s hotel towel experiments showed that norms-based messages ('Most guests reuse their towels') outperform environmental-appeal messages in reducing towel usage. This 'social proof' mechanism operates through the human tendency to use others' behaviour as a guide under uncertainty.\n\nRecycling behaviour is a natural testbed: contamination rates (wrong items in bins) are easily measurable, the intervention is cheap to implement, and the outcome has real environmental significance. Field experiments in communal living spaces offer high ecological validity.",
    "scenario": "You conduct a four-week field experiment in three matched university dormitory corridors (similar size, similar student demographics). In week 1, you observe baseline recycling compliance (% of deposits that are correctly sorted) in all three corridors. In weeks 2–4, you assign treatments: (A) no sign (control), (B) environmental appeal sign ('Protect the planet — recycle!'), (C) social norm sign ('80% of students in this corridor recycled correctly last week'). A research assistant audits each bin daily and codes each deposit as correctly sorted or not (contaminated).",
    "task": "Design a research methodology that tests whether sign type affects recycling compliance. Define the IV (sign condition), DV (daily compliance rate %), and the key control variable (baseline compliance). Choose the appropriate field experiment method, describe how you collect observational data, select the right multi-group analysis, and draw a conclusion about which message type is most effective.",
    "constraints": [
      "You assign sign conditions to corridors — this is an active field intervention.",
      "Daily compliance rate is a proportion (0–100%) — continuous numeric outcome.",
      "Three conditions → analysis for comparing more than two group means.",
      "Controls: corridor size, bin placement, day of week, academic calendar events.",
      "Baseline week provides a control for pre-existing differences between corridors."
    ],
    "input_format": "3 corridors × 21 observation days (weeks 2–4) = 63 compliance rate observations (one per corridor per day).",
    "expected_output": "Field experiment: directional hypothesis → IV / DV / control → method_experiment_field → medium sample → data_observation_notes or data_count → analysis_anova → conclusion."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You assign conditions to corridors in the real world — field experiment, not lab.",
    "You count correct vs incorrect deposits — data_count or observation-based recording.",
    "Three sign conditions → ANOVA."
  ],
  "tags": ["experiment","quantitative","sociology","behavioural-science","social-norms","environment","field-experiment"],
  "pillar": "human_social",
  "subtopic": "sociology"
},

{
  "id": "price_framing_willingness_to_pay",
  "title": "Does gain vs loss framing of a price change affect willingness to pay for a subscription?",
  "difficulty": "intermediate",
  "level": 37,
  "description": "You hypothesise that framing a price increase as avoiding a loss ('You will lose access to premium features if you don't upgrade') raises willingness to pay (WTP) more than gain framing ('Upgrade to unlock premium features'), consistent with prospect theory.",
  "brief": {
    "background": "Prospect theory (Kahneman & Tversky, 1979) predicts that people are loss-averse: the psychological pain of losing something is roughly twice the pleasure of gaining an equivalent thing. This asymmetry has direct implications for marketing — messages framed as avoiding a loss should be more motivating than messages framed as gaining an equivalent benefit.\n\nSubscription services routinely test message framing in A/B experiments. But rigorously isolating framing from confounds (message length, emotional valence, product quality beliefs) requires a carefully controlled laboratory or online experiment.",
    "scenario": "You recruit 120 online participants via Prolific. Each participant reads a description of a fictional note-taking app's premium subscription and sees one of three messages about a hypothetical price increase: (A) gain frame ('Upgrade to Premium and unlock smart summaries and offline sync for £3/month more'), (B) loss frame ('Stay on Free and lose access to smart summaries and offline sync — or upgrade for £3/month more'), (C) neutral frame ('Premium now includes smart summaries and offline sync at an additional £3/month'). Participants then state their maximum willingness to pay (£/month) using a continuous slider (£0–£10).",
    "task": "Design a research pipeline that tests whether framing type affects WTP. Define IV, DV, and control variables. Choose the study method, sampling strategy, data collection approach, multi-group analysis, and draw a conclusion about whether loss framing produces the highest WTP as predicted by prospect theory.",
    "constraints": [
      "You randomly assign participants to message conditions — experimental manipulation.",
      "WTP (£/month on a continuous slider) is a numeric measure.",
      "Three conditions → ANOVA.",
      "Controls: app description quality, message word count, product familiarity, participant income level.",
      "Random assignment prevents self-selection — use random sampling."
    ],
    "input_format": "120 participants × 3 conditions (40 each). Each participant gives one WTP value on a £0–£10 slider.",
    "expected_output": "Online lab experiment → ANOVA → directional conclusion about whether loss framing raises WTP."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "Online random assignment and manipulation → lab experiment.",
    "WTP on a slider is a continuous number — data_measurement.",
    "Three framing conditions → ANOVA."
  ],
  "tags": ["experiment","quantitative","behavioural-economics","framing","prospect-theory","marketing"],
  "pillar": "human_social",
  "subtopic": "economics"
},

# ═══════════════════════════════════════════════════════════════
# MATHEMATICS / STATISTICS
# ═══════════════════════════════════════════════════════════════

{
  "id": "bootstrap_ci_skewed_data",
  "title": "Does bootstrapping produce more accurate confidence intervals than t-intervals for skewed income data?",
  "difficulty": "intermediate",
  "level": 38,
  "description": "You want to compare the coverage probability of 95% bootstrap CIs versus parametric t-intervals when the underlying population is log-normally distributed, using simulation at sample sizes n = 20, 50, and 100.",
  "brief": {
    "background": "The standard 95% confidence interval derived from the t-distribution assumes that the sampling distribution of the mean is approximately normal — a safe assumption for large samples (central limit theorem) but problematic for small samples drawn from heavily skewed populations such as income, reaction times, or biological concentrations.\n\nBootstrap confidence intervals make no parametric assumptions: they repeatedly resample (with replacement) from the observed data to empirically estimate the sampling distribution. Monte Carlo simulation studies, where the true population is known, can directly measure whether a CI procedure achieves its nominal 95% coverage — a rigorous way to compare methods.",
    "scenario": "You run a Monte Carlo simulation study. You define a log-normal population (µ = 0, σ = 1, mean ≈ £1,650 if scaled to income). You draw 10,000 random samples at each of three sizes: n = 20, 50, and 100. For each sample you compute (A) the standard 95% t-interval and (B) the 95% percentile bootstrap CI (2,000 resamples). You record whether the true population mean falls within each CI type ('coverage'). You compare coverage rates across both methods and all three sample sizes.",
    "task": "Design a research methodology that tests whether bootstrap CIs achieve better coverage than t-intervals for skewed data, and whether this advantage diminishes as sample size grows. Specify a nondirectional or directional hypothesis, define IV (CI method and sample size), DV (empirical coverage %), choose the appropriate simulation method, describe how you collect coverage data, select the right analysis, and draw a conclusion.",
    "constraints": [
      "You fully control the simulation parameters — this is active experimental manipulation via numerical simulation.",
      "Coverage rate is a proportion (a number from 0 to 1) measured empirically from 10,000 trials.",
      "Six conditions (2 CI methods × 3 sample sizes) → a multi-factor comparison; regression or ANOVA applies.",
      "Control for: population distribution, number of simulation trials, bootstrap resample count, random seed.",
      "Your conclusion should address both the CI method effect and whether it interacts with sample size."
    ],
    "input_format": "2 CI methods × 3 sample sizes × 10,000 simulated samples = 60,000 CI computations. Each yields a binary coverage indicator; you aggregate to coverage rate per cell.",
    "expected_output": "Numerical simulation → regression or ANOVA across CI method × sample size → conclusion about when bootstrap outperforms t-interval."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You run a computer simulation — method_numerical_sim.",
    "Coverage rate is a number derived from simulation output — data_numerical_output.",
    "Six conditions with two factors (CI type × n) — regression or ANOVA handles this."
  ],
  "tags": ["simulation","quantitative","statistics","bootstrap","confidence-intervals","Monte-Carlo"],
  "pillar": "mathematics",
  "subtopic": "statistics"
},

{
  "id": "multiple_testing_fdr_power",
  "title": "Does Benjamini–Hochberg FDR correction preserve more statistical power than Bonferroni in a genome-wide association study?",
  "difficulty": "advanced",
  "level": 39,
  "description": "You want to compare the statistical power (proportion of true positives detected) of Bonferroni correction versus Benjamini–Hochberg FDR control when the number of simultaneous tests ranges from 100 to 100,000, using a simulation study where the true positive rate is known.",
  "brief": {
    "background": "In genome-wide association studies (GWAS), researchers test millions of genetic variants simultaneously for association with a trait. The multiple comparisons problem is acute: testing 10⁶ variants at α = 0.05 would expect 50,000 false positives. Two dominant correction strategies exist:\n\nBonferroni correction divides α by the number of tests, controlling the family-wise error rate (FWER — probability of any false positive). It is conservative when tests are correlated and when the number of tests is very large, often missing genuine signals.\n\nBenjamini–Hochberg (BH) controls the false discovery rate (FDR — expected proportion of false positives among discoveries). It is less conservative than Bonferroni under independence or positive dependence, and typically yields higher power at the cost of some false positives.",
    "scenario": "You run a simulation study modelling a GWAS scenario. You generate vectors of p-values under a mixture model: 1% true positives (drawn from a non-central distribution) and 99% nulls (drawn from Uniform[0,1]). You repeat this at four test counts: m = 100, 1,000, 10,000, and 100,000. For each simulation, you apply both Bonferroni and BH at α = 0.05. You measure power (% of true positives detected) and FDR (% of discoveries that are false) across 1,000 simulation replications.",
    "task": "Design a research methodology that tests whether BH correction provides higher power than Bonferroni at each test count, and whether the power difference grows with m. Specify the hypothesis, define IV (correction method, number of tests), DV (statistical power), choose the simulation method, describe numerical data collection, select the right multi-factor analysis, and draw a conclusion with appropriate caveats.",
    "constraints": [
      "You generate all p-values computationally — this is a numerical simulation study.",
      "Statistical power is a proportion computed from 1,000 simulation runs per cell.",
      "Eight conditions (2 methods × 4 test counts) → multi-factor analysis.",
      "Control for: proportion of true positives (1%), effect size distribution for true positives, random seed.",
      "Your conclusion should distinguish power at low vs. high m and acknowledge the FDR vs. FWER trade-off."
    ],
    "input_format": "2 correction methods × 4 test counts × 1,000 simulation reps = 8,000 simulation runs. Each yields a power estimate and FDR estimate.",
    "expected_output": "Numerical simulation → regression or ANOVA (method × m interaction) → conclusion about relative power with caveats about the FWER vs. FDR trade-off."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You generate the p-value data computationally — numerical simulation (not wet lab, not survey).",
    "Statistical power is a number computed from simulation output — data_numerical_output.",
    "2 methods × 4 test counts = 8 cells; test for interaction → regression or ANOVA with interaction."
  ],
  "tags": ["simulation","quantitative","statistics","multiple-testing","GWAS","genomics","power-analysis"],
  "pillar": "mathematics",
  "subtopic": "statistics"
},

# ═══════════════════════════════════════════════════════════════
# ENGINEERING
# ═══════════════════════════════════════════════════════════════

{
  "id": "wing_aspect_ratio_lift_drag",
  "title": "Does increasing wing aspect ratio improve the lift-to-drag ratio in subsonic flow?",
  "difficulty": "intermediate",
  "level": 40,
  "description": "You want to test whether rectangular wings with higher aspect ratios (span²/area) produce higher lift-to-drag (L/D) ratios at a fixed angle of attack (5°) in a low-speed wind tunnel, as predicted by Prandtl's lifting-line theory.",
  "brief": {
    "background": "Prandtl's lifting-line theory predicts that induced drag is inversely proportional to aspect ratio: Di ∝ CL² / (π × AR). High aspect-ratio wings (like those of gliders and albatrosses) experience less induced drag for the same lift, producing a higher L/D ratio and better aerodynamic efficiency. This principle underpins the design of long-range aircraft and racing sailplanes.\n\nWind tunnel experiments allow precise measurement of lift and drag forces across different wing geometries under controlled flow conditions. By systematically varying aspect ratio while holding wing area, airfoil profile, and angle of attack constant, you can test the theoretical prediction empirically.",
    "scenario": "You fabricate five rectangular wings from the same NACA 0012 airfoil, each with the same planform area (0.06 m²) but different spans: 0.2, 0.3, 0.4, 0.6, and 0.8 m (aspect ratios: 0.67, 1.5, 2.67, 6.0, 10.67). You mount each wing in a subsonic wind tunnel at freestream velocity 20 m/s and angle of attack 5°. You measure lift (L) and drag (D) using a six-axis force balance, compute L/D, and repeat each measurement five times.",
    "task": "Design a research methodology that tests whether aspect ratio predicts L/D ratio. Specify a directional hypothesis, IV (aspect ratio), DV (L/D), and control variables. Choose the appropriate engineering lab method, describe force measurement data collection, select the analysis that models the IV→DV relationship for a continuous IV, and draw a conclusion about whether the data match Prandtl's prediction.",
    "constraints": [
      "You fabricate and select each wing geometry — direct experimental manipulation.",
      "L/D ratio is a continuous numeric outcome from force balance measurements.",
      "Five aspect ratios as a continuous IV → regression (not ANOVA) to model the relationship.",
      "Controls: wing area, airfoil profile, freestream velocity, angle of attack, wind tunnel turbulence intensity.",
      "Wall interference effects in the tunnel may introduce systematic error — acknowledge this limitation."
    ],
    "input_format": "5 aspect ratios × 5 measurement repeats = 25 force balance measurements. Each yields L and D values; you compute L/D.",
    "expected_output": "Lab experiment (wind tunnel): directional hypothesis → IV (AR) / DV (L/D) / controls → experiment_lab → medium sample → data_sensor or data_measurement → regression → conclusion comparing to theoretical prediction."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You control wing geometry in a lab setting — lab experiment.",
    "Force balance gives numeric lift and drag values — data_sensor or data_measurement.",
    "Continuous IV (aspect ratio) predicting continuous DV (L/D) → regression."
  ],
  "tags": ["experiment","quantitative","aerodynamics","fluid-mechanics","engineering","wind-tunnel"],
  "pillar": "engineering",
  "subtopic": "mechanical_aerospace"
},

{
  "id": "network_topology_fault_tolerance",
  "title": "Does network topology type affect fault tolerance under random node failure in distributed systems?",
  "difficulty": "intermediate",
  "level": 41,
  "description": "You want to compare the fault tolerance (fraction of nodes that must fail before the network disconnects) of three network topologies — ring, mesh, and scale-free — under random node removal, using graph-theoretic simulation.",
  "brief": {
    "background": "Distributed systems — cloud platforms, peer-to-peer networks, power grids — are modelled as graphs where nodes are machines and edges are communication links. When nodes fail randomly (hardware faults, crashes), a critical question is how many failures the network can absorb before becoming disconnected (i.e., some nodes can no longer communicate with others).\n\nAlbert and Barabási (2000) showed that scale-free networks (power-law degree distribution, as in the internet) are remarkably robust to random failure but fragile to targeted attack. Ring and mesh topologies have very different failure dynamics. Comparing them under controlled simulation allows precise measurement of fault tolerance as a function of topology.",
    "scenario": "You implement three synthetic network topologies, each with N = 500 nodes: (A) ring topology (each node connected to 2 neighbours), (B) regular mesh (≈4 neighbours per node), (C) Barabási–Albert scale-free graph (preferential attachment, average degree ≈ 4). For each topology, you simulate random node removal in increments of 1% and measure the size of the largest connected component (LCC) after each removal step. You find the critical failure fraction f* where LCC drops below 50% of N. You run 20 independent simulations per topology.",
    "task": "Design a research methodology that tests whether topology type predicts fault tolerance (f*). Specify a directional hypothesis (scale-free should be most robust to random failure), define IV (topology type), DV (f*), and control variables. Choose the appropriate simulation method, describe numerical data collection, select the right multi-group analysis, and draw a conclusion.",
    "constraints": [
      "You generate and configure each network topology computationally — active manipulation via simulation.",
      "f* (critical failure fraction) is a continuous numeric value from simulation.",
      "Three topology types → ANOVA for comparing group means.",
      "Controls: network size (N = 500), average node degree (≈4 for all topologies), random seed.",
      "Scale-free networks have degree heterogeneity that may inflate variance — acknowledge this in your design."
    ],
    "input_format": "3 topologies × 20 simulation runs = 60 f* values. Each run produces one critical failure fraction.",
    "expected_output": "Numerical simulation → ANOVA → directional conclusion about relative fault tolerance with scale-free expected most robust."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You generate networks computationally and simulate failures — numerical simulation.",
    "f* is a number per simulation run — data_numerical_output.",
    "Three topology types → ANOVA."
  ],
  "tags": ["simulation","quantitative","distributed-systems","network-science","fault-tolerance","engineering"],
  "pillar": "engineering",
  "subtopic": "electrical_computer"
},

# ═══════════════════════════════════════════════════════════════
# SCIENCE  —  Broken Lab (biology — no control group)
# ═══════════════════════════════════════════════════════════════

{
  "id": "broken_lab_fertiliser_no_control",
  "type": "broken_lab",
  "title": "Broken: plant growth study missing control group and using wrong analysis",
  "difficulty": "intermediate",
  "level": 42,
  "description": "A student designed an experiment to test whether nitrogen fertiliser concentration affects plant stem height — but omitted a zero-fertiliser control group, used convenience sampling, chose a t-test for three conditions, and drew a causal conclusion from an incomplete design. Find and fix all four errors.",
  "brief": {
    "background": "This pipeline tests the effect of nitrogen fertiliser concentration (0, 50, 100 mg/L) on the stem height of bean seedlings after 4 weeks. The student pre-built a pipeline but made four critical errors: no control variable block, convenience sampling rather than random, t-test instead of ANOVA for three conditions, and no confounding variable block to account for light/water variation.",
    "scenario": "Inspect the pre-built pipeline. Every block that is wrong for a three-condition plant growth experiment must be replaced. You should end up with: a directional hypothesis, IV + DV + control variable + confounding variable, wet lab method, random sampling, large sample size, measurement data, ANOVA analysis, and a properly cautious conclusion.",
    "task": "Fix all four errors: (1) add a control_variable block, (2) replace sampling_convenience with sampling_random, (3) replace analysis_t_test with analysis_anova, (4) add a confounding_variable block for light and water confounds.",
    "constraints": [
      "Three fertiliser concentrations require ANOVA, not a t-test.",
      "A control group (0 mg/L) must be in the design, and a control_variable block must appear in the pipeline.",
      "Convenience sampling (grabbing the nearest seedlings) introduces selection bias — random sampling is required.",
      "Light intensity and water volume are confounding variables that must be acknowledged."
    ],
    "input_format": "Pre-built broken pipeline with 4 errors: missing control_variable, sampling_convenience, analysis_t_test (wrong for 3 groups), missing confounding_variable.",
    "expected_output": "Fixed: hypothesis_directional → independent_variable + dependent_variable + control_variable + confounding_variable → method_wet_lab → sampling_random + sample_large → data_measurement → analysis_anova → conclusion_supports or rejects."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "Three fertiliser levels means three groups — which analysis handles more than two group means?",
    "Every experiment needs a control variable block to show you're accounting for confounds like watering schedule.",
    "Convenience sampling (using the first seedlings you find) biases the study — random assignment of seedlings to conditions is needed."
  ],
  "tags": ["broken-lab","debugging","experiment","quantitative","biology","plant-science"],
  "pillar": "science",
  "subtopic": "biology_organismal",
  "broken_canvas": {
    "blocks": [
      {"instanceId": "b1", "blockDefId": "hypothesis_directional",   "x": 60,  "y": 120},
      {"instanceId": "b2", "blockDefId": "independent_variable",     "x": 260, "y": 60},
      {"instanceId": "b3", "blockDefId": "dependent_variable",       "x": 260, "y": 200},
      {"instanceId": "b4", "blockDefId": "method_wet_lab",           "x": 460, "y": 120},
      {"instanceId": "b5", "blockDefId": "sampling_convenience",     "x": 660, "y": 60},
      {"instanceId": "b6", "blockDefId": "sample_small",             "x": 660, "y": 200},
      {"instanceId": "b7", "blockDefId": "data_measurement",         "x": 860, "y": 120},
      {"instanceId": "b8", "blockDefId": "analysis_t_test",          "x": 1060,"y": 120},
      {"instanceId": "b9", "blockDefId": "conclusion_supports",      "x": 1260,"y": 120}
    ],
    "connections": [
      {"id": "c1", "fromInstanceId": "b1", "toInstanceId": "b2"},
      {"id": "c2", "fromInstanceId": "b1", "toInstanceId": "b3"},
      {"id": "c3", "fromInstanceId": "b2", "toInstanceId": "b4"},
      {"id": "c4", "fromInstanceId": "b3", "toInstanceId": "b4"},
      {"id": "c5", "fromInstanceId": "b4", "toInstanceId": "b5"},
      {"id": "c6", "fromInstanceId": "b5", "toInstanceId": "b6"},
      {"id": "c7", "fromInstanceId": "b6", "toInstanceId": "b7"},
      {"id": "c8", "fromInstanceId": "b7", "toInstanceId": "b8"},
      {"id": "c9", "fromInstanceId": "b8", "toInstanceId": "b9"}
    ]
  }
},

# ═══════════════════════════════════════════════════════════════
# SCIENCE  —  Advanced (multi-variable, complex designs)
# ═══════════════════════════════════════════════════════════════

{
  "id": "drug_dose_response_curve",
  "title": "Does aspirin dose follow a non-linear dose–response relationship for platelet aggregation inhibition?",
  "difficulty": "advanced",
  "level": 43,
  "description": "You want to characterise the dose–response relationship between aspirin concentration (0.1–1000 µM) and platelet aggregation inhibition (% aggregation relative to control) using an in vitro platelet aggregometry assay, fitting a sigmoidal Hill function to estimate IC50.",
  "brief": {
    "background": "Aspirin inhibits cyclooxygenase (COX-1/COX-2), reducing thromboxane A2 production and thereby inhibiting platelet aggregation — its anti-thrombotic mechanism. Dose–response relationships for enzyme inhibitors often follow a sigmoidal Hill equation: Effect = E_max × C^n / (IC50^n + C^n), where IC50 is the concentration producing 50% inhibition and n is the Hill coefficient.\n\nCharacterising IC50 precisely is clinically important: it informs dosing to achieve sufficient platelet inhibition without over-suppression. In vitro aggregometry — measuring optical density changes when platelets aggregate — provides a controlled, quantitative endpoint. Logarithmically-spaced concentrations covering several decades bracket the IC50 accurately.",
    "scenario": "You prepare platelet-rich plasma (PRP) from healthy donors. You incubate PRP with aspirin at 10 logarithmically-spaced concentrations: 0.1, 0.3, 1, 3, 10, 30, 100, 300, 500, and 1000 µM. After 15 minutes of incubation, you trigger aggregation with ADP (5 µM) and measure maximum aggregation (%) using a Born aggregometer. You run four biological replicates (different donors) per concentration. You also run a DMSO vehicle control (0 µM aspirin) and a complete inhibition positive control (10 µM indomethacin).",
    "task": "Design a research methodology that characterises the aspirin dose–response curve. Specify a directional hypothesis (aspirin inhibits aggregation in a dose-dependent manner), define IV (aspirin concentration), DV (% aggregation inhibition), confounding variables (donor variability, PRP preparation), choose the in vitro method, describe spectroscopic data collection, select the regression analysis for fitting a sigmoidal curve, and draw a conclusion about IC50.",
    "constraints": [
      "Aspirin concentration is prepared by you — active experimental manipulation.",
      "% aggregation inhibition is a continuous numeric measurement from optical density.",
      "IC50 estimation from a sigmoidal curve requires non-linear regression — ANOVA is inappropriate here.",
      "Donor variability is a major confounding variable — using multiple donors and acknowledging inter-donor variance is essential.",
      "Controls: vehicle control (DMSO), positive inhibition control (indomethacin), temperature (37°C), PRP preparation protocol."
    ],
    "input_format": "10 concentrations × 4 donors = 40 aggregometry measurements. Each yields a % maximum aggregation; you compute % inhibition relative to vehicle control.",
    "expected_output": "In vitro experiment: directional hypothesis → IV (concentration) / DV (inhibition %) / confounding (donor variability) → method_in_vitro → sample_medium → data_spectroscopy → analysis_regression → conclusion about IC50 range."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You work with cells/plasma in a test tube — in vitro experiment.",
    "Absorbance data from an aggregometer — data_spectroscopy.",
    "Fitting a sigmoidal curve to continuous IV and DV → regression."
  ],
  "tags": ["experiment","quantitative","pharmacology","biochemistry","dose-response","in-vitro","platelet"],
  "pillar": "science",
  "subtopic": "biology_molecular"
},

{
  "id": "climate_co2_coral_bleaching",
  "title": "Does elevated dissolved CO2 increase coral bleaching rate in Acropora sp. under thermal stress?",
  "difficulty": "advanced",
  "level": 44,
  "description": "You want to test whether ocean acidification (elevated pCO2) exacerbates thermal bleaching in Acropora coral fragments, using a factorial design crossing two CO2 levels with two temperature levels in a controlled mesocosm experiment.",
  "brief": {
    "background": "Coral bleaching occurs when elevated sea surface temperatures stress the coral–zooxanthellae symbiosis, causing the coral to expel its symbiotic algae and turn white. Ocean acidification — the reduction in seawater pH due to absorbed atmospheric CO2 — is a separate stressor that impairs coral calcification. Together, warming and acidification may interact synergistically, but empirically characterising the interaction effect requires a factorial experiment in controlled conditions.\n\nMesocosm experiments (controlled aquaria simulating ocean conditions) allow manipulation of both temperature and CO2 while holding other variables constant. This kind of 2×2 factorial design can detect not only main effects but also an interaction — whether the two stressors combined cause more bleaching than would be predicted from their individual effects.",
    "scenario": "You maintain 80 Acropora sp. coral fragments (5 per tank, 16 tanks) in recirculating seawater mesocosms. You apply a 2×2 factorial design: CO2 (ambient 400 ppm vs elevated 800 ppm) × Temperature (27°C control vs 31°C thermal stress), with 4 replicate tanks per condition. After 4 weeks, you measure bleaching as % zooxanthellae density reduction (Symbiodinium cells/cm² relative to baseline). You also record coral mortality.",
    "task": "Design a research pipeline for this factorial experiment. Specify a hypothesis that addresses both main effects and the interaction (does elevated CO2 amplify thermal bleaching?). Define IV1 (CO2 level), IV2 (temperature), DV (% zooxanthellae density reduction), and confounding variables. Choose the lab method, describe data collection, select the analysis that captures both main effects and interaction (2-way ANOVA), and draw a conclusion about synergistic effects.",
    "constraints": [
      "Both CO2 and temperature are actively controlled and manipulated — wet lab / mesocosm experiment.",
      "Zooxanthellae density (cells/cm²) is a continuous numeric measurement from microscopy.",
      "A 2×2 factorial design with interaction requires two-way ANOVA — not a simple t-test or one-way ANOVA.",
      "Confounding variables: tank position in room, initial fragment health, light intensity across tanks.",
      "Pseudoreplication risk: multiple fragments in the same tank are not independent — tank is the experimental unit."
    ],
    "input_format": "4 treatments × 4 tanks × 5 fragments = 80 observations. Tank mean is the independent replicate for analysis (n = 4 per treatment).",
    "expected_output": "Wet lab / in vitro mesocosm: directional hypothesis (interaction) → 2 IVs + DV + confounding → method_wet_lab → sample_medium → data_microscopy → analysis_anova (2-way) → conclusion about synergistic effect."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You control both CO2 and temperature in tanks — wet lab experiment.",
    "Zooxanthellae density from microscope — data_microscopy.",
    "2×2 factorial with interaction → ANOVA (two-way ANOVA)."
  ],
  "tags": ["experiment","quantitative","marine-biology","climate-change","coral","ocean-acidification","factorial-design"],
  "pillar": "science",
  "subtopic": "biology_organismal"
},

# ═══════════════════════════════════════════════════════════════
# HUMAN/SOCIAL  —  Expert / complex design
# ═══════════════════════════════════════════════════════════════

{
  "id": "longitudinal_screen_time_attention",
  "title": "Does daily screen time predict attention span decline over a 6-month longitudinal study in adolescents?",
  "difficulty": "advanced",
  "level": 45,
  "description": "You want to test whether higher baseline daily screen time (hours/day) predicts greater decline in sustained attention (d-prime from a continuous performance task) over 6 months in 13–16-year-olds, controlling for sleep duration and socioeconomic status.",
  "brief": {
    "background": "Concerns about the cognitive effects of screen time on adolescent attention have intensified with the rise of short-form video platforms. Cross-sectional studies have found negative correlations between screen time and attention measures, but cannot establish temporal precedence — does screen time reduce attention, or do children with shorter attention spans seek more stimulating screen content?\n\nA longitudinal design — measuring the same participants at multiple time points — can establish whether initial screen time predicts change in attention over time, providing stronger (though not conclusive) evidence for the direction of the effect. Regression with lagged predictors is the standard analytical tool for such questions.",
    "scenario": "You recruit 200 adolescents aged 13–16 from three secondary schools. At baseline (T1), you measure: (A) average daily screen time (hours, via one-week accelerometer + app logging), (B) sustained attention d-prime via a 15-minute Continuous Performance Task (CPT) administered on a laptop, (C) average nightly sleep duration (hours, via actigraphy), (D) SES proxy (free school meal eligibility). At 6 months (T2), you re-administer the CPT. You define the outcome as the change in d-prime from T1 to T2.",
    "task": "Design a research methodology for this longitudinal study. Specify a directional hypothesis (higher T1 screen time predicts larger attention decline), define IV (T1 screen time), DV (T1→T2 change in d-prime), and the key confounders (sleep, SES). Choose the appropriate longitudinal method, describe how you collect cognitive and behavioural data, select the regression analysis that handles multiple covariates, and draw a conclusion with appropriate causal caveats.",
    "constraints": [
      "Screen time is measured (not experimentally manipulated) — this is observational, not experimental.",
      "D-prime change is a continuous numeric outcome from cognitive testing.",
      "Multiple covariates (sleep, SES) require a regression framework — not a simple correlation.",
      "Attrition over 6 months must be addressed — random or stratified sampling at baseline improves representativeness.",
      "Longitudinal correlation does not establish causation — your conclusion must reflect this limitation."
    ],
    "input_format": "200 adolescents × 2 time points. Each participant has: T1 screen time, T1 d-prime, T2 d-prime, sleep duration, SES indicator.",
    "expected_output": "Longitudinal observational study → regression with covariates → directional but causally-cautious conclusion about screen time predicting attention decline."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You observe and measure but don't manipulate screen time — observational longitudinal study.",
    "D-prime and screen time are both continuous numbers — data_measurement.",
    "Multiple predictors and covariates → regression analysis."
  ],
  "tags": ["longitudinal","quantitative","psychology","adolescents","screen-time","attention","observational"],
  "pillar": "human_social",
  "subtopic": "psychology"
},

{
  "id": "gig_economy_income_volatility",
  "title": "Does participation in gig economy platforms increase income volatility compared to traditional employment?",
  "difficulty": "advanced",
  "level": 46,
  "description": "Using administrative payroll and platform earnings data from 1,200 workers over 24 months, you want to test whether gig workers experience significantly higher month-to-month income variance than matched traditionally-employed workers, controlling for occupation and education.",
  "brief": {
    "background": "The expansion of app-mediated gig work (ride-hailing, food delivery, freelance platforms) has created a large workforce without guaranteed hours or minimum earnings. Proponents argue gig work provides flexibility; critics argue it transfers income risk from employers to workers. Income volatility — measured as within-person variance in monthly earnings — directly affects ability to budget, access credit, and plan financially.\n\nAdministrative data (tax records, bank transactions, platform disbursement logs) increasingly allow researchers to measure income volatility with precision. Comparing volatility between gig workers and matched traditional employees, while controlling for occupation and education, tests whether the employment arrangement itself drives volatility.",
    "scenario": "You obtain anonymised administrative earnings data from a government labour agency (ethics-approved) for two groups: (A) 600 workers who earned at least 50% of income from gig platforms in year 1, (B) 600 traditionally-employed workers matched on occupation category, education level, and region. You calculate the coefficient of variation (CV = std/mean) of monthly earnings for each worker over 24 months. You also record whether workers switched categories (gig→traditional) during the observation window.",
    "task": "Design a research pipeline for this observational study. Specify a directional hypothesis, define IV (employment type: gig vs traditional), DV (income CV over 24 months), and control variables (occupation, education, region). Choose the observational method, describe how you collect and record administrative earnings data, select the regression analysis for controlling covariates, and draw a conclusion that appropriately acknowledges selection bias.",
    "constraints": [
      "Employment type is observed, not assigned — this is an observational study, not an experiment.",
      "Income CV is a continuous numeric value computed per worker from 24 months of data.",
      "Occupation, education, and region are confounders — regression controls for them.",
      "Self-selection: workers who choose gig work may differ systematically in risk tolerance from traditional employees — acknowledge this in your conclusion.",
      "Large sample (N=1,200) provides adequate power but does not eliminate confounding."
    ],
    "input_format": "1,200 workers × 24 monthly earnings observations = 28,800 data points. You compute per-worker CV and use it as the outcome in regression.",
    "expected_output": "Observational study → regression with confounders → directional but selection-bias-cautious conclusion about gig employment and income volatility."
  },
  "available_categories": ["HYPOTHESIS","VARIABLE","METHOD","SAMPLE","DATA_COLLECTION","ANALYSIS","CONCLUSION"],
  "hints": [
    "You use existing administrative data — observational study, not experiment.",
    "Income CV is computed from payroll data — data_measurement.",
    "Controlling for occupation and education → regression analysis."
  ],
  "tags": ["observational","quantitative","economics","gig-economy","income","labour","regression"],
  "pillar": "human_social",
  "subtopic": "economics"
},

]

# ── Merge and write ────────────────────────────────────────────────────────────
with open(DATA_FILE, encoding="utf-8") as f:
    data = json.load(f)

if isinstance(data, dict):
    challenges = data["challenges"]
    wrap = True
else:
    challenges = data
    wrap = False

existing_ids = {c["id"] for c in challenges}
added = 0
for c in NEW_CHALLENGES:
    if c["id"] not in existing_ids:
        challenges.append(c)
        existing_ids.add(c["id"])
        added += 1
    else:
        print(f"Skipped (already exists): {c['id']}")

# Re-sort by level
challenges.sort(key=lambda x: x.get("level", 999))

output = {"challenges": challenges} if wrap else challenges
with open(DATA_FILE, "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"Added {added} new challenges. Total: {len(challenges)}")
