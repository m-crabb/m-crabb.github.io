---
layout: post
title: "Leveraging uncertainty for monitoring in AI control"
dek: "Write-up in progress."
date: 2026-11-09
---

Coming soon; a short summary of the work I completed as a [MARS](https://caish.org/mars) research fellow at the Cambridge AI Safety Hub. Our paper, *What the monitor saw*, was accepted into two NeurIPS 2026 workshops, however given each review was fully AI generated, I opted to withdraw it prior to the conference. My goal isn't to turn this post into a debate about the current state of publication (particularly in AI/ML), but instead share our findings for interested readers.

## Motivation

Agentic AI systems have proliferated over the last couple of years, and as capabilities increase, questions surrounding their monitoring and oversight become all the more important. These agents are acting in high-stakes environments in the real-world, and so effective supervision is of key concern. Whether or not we believe the systems to be aligned is actually of little importance. They, like humans, are prone to making mistakes. How do we ensure we have adequate controls to prevent these from happening?

The widely accepted standard set-up in AI control is the untrusted-trusted regime - take a model we understand well and consider to be trustworthy, and use it to monitor the untrustworthy model. The former reviews each action of the latter, and assigns an integer suspicion score, and actions that exceed a pre-defined threshold will be escalated to expert human review.[^control] Deployed monitoring systems hence follow a similar pattern, where the trusted model is often one that's sufficiently lightweight that it doesn't massively affect inference time (or cost), but is capable enough that it doesn't escalate too many false positives. The latter is not only expensive but in short supply, if you consider the amount of throughput.

A slightly more refined approach discussed by Anthropic in their constitutional classifier posts,[^cc] and by Apollo when discussing their monitoring system Watcher,[^watcher] is to use a *cascade*. Instead of using one monitor, use two (or more) in a heirarchical structure, where traffic first hits the weak monitor, and is escalated up the chain subject to some decision rule. We can then set a budget on the percentage of activity we send to the stronger monitor, effectively reducing cost by its inverse. Ensemble monitoring is another interesting and robust approach, though less likely to be used in practical deployments given the additive cost.[^ensembles]

So, a cascade sounds good; most of the time our monitoring is cheap and fast, and we get the benefits of a stronger monitor when the occassion demands it. The issue is that weak monitors are often poorly calibrated[^calibration] and likely need supplemental information to ensure it's trustworthy. Why should we take its output at face value, without considering its uncertainty? We know we're able to recover a plethora of uncertainty signals from both the model internals[^internals] and its output,[^outputs] can we leverage these to make better monitoring decisions? While this is where we began, what followed was a journey down a winding path of monitoring cascade design choices, as many of the technical details of how these work in practice are not publicly available.[^practice]

## Designing a control cascade

To begin with, we need the agent we'll be monitoring, which for the purposes of this exercise we will assume we only have black-box access to (i.e. we can't access its weights, internals, etc.). Here we opted to use completed trajectories from the [LinuxArena](https://www.linuxarena.ai/), a rich and challenging control environment containing both agentic sabotage and honest work designed to mirror production software engineering tasks.[^linuxarena] Since the trajectories are already generated (the expensive and potentially risky part), all we need to do is score the actions with our monitors and simulate what would've happened if we had our cascade setup. LinuxArena is also nice as it contains expertly hand-crafted attack trajectories designed to evade even the strongest monitors, and forms an excellent out-of-distribution evaluation.

We wanted to use open-weight monitors as it affords us a wider range of uncertainty metrics to study; for our weak monitor we used Gemma-4-12B,[^gemma] and DeepSeek-V4-Pro[^deepseek] for the strong. We opted to use monitors outside of the same family...

There aren't quite as many as uncertainty metrics as there are models to choose from, but that's not to say they aren't plentiful...

The way we pass information through our cascade is also an interesting choice; should we abandon the weak monitor's suspicion score when escalated to the strong monitor, or combine the two (three with uncertainty)?[^combining]. We opted to go with the latter, taking the view that having more evidence is likely not a bad thing.

Escalation prompt...

## Findings

## Limitations and Future Work

Saturation of monitors, and different families with different behaviours/scoring tendencies.
Models are not specifically trained with monitoring in mind...

## Acknowledgements

[^control]: Greenblatt et al., [AI Control: Improving Safety Despite Intentional Subversion](https://arxiv.org/abs/2312.06942) (2024); Korbak et al., [A sketch of an AI control safety case](https://arxiv.org/abs/2501.17315) (2025).
[^cc]: Sharma et al., [Constitutional Classifiers](https://arxiv.org/abs/2501.18837) (2025); Cunningham et al., [Constitutional Classifiers++](https://arxiv.org/abs/2601.04603) (2026); Anthropic, [Cost-Effective Constitutional Classifiers via Representation Re-use](https://alignment.anthropic.com/2025/cheap-monitors/) (2025).
[^watcher]: Apollo Research, [Watcher: Technical Details for Teams](https://watcher.apolloresearch.ai/blog/monitor-coding-agents/) (2026).
[^ensembles]: Lakshminarayanan et al., [Simple and Scalable Predictive Uncertainty Estimation using Deep Ensembles](https://arxiv.org/abs/1612.01474) (2017); Apollo Research, [Evaluating LLM Calibration for Coding-Agent Monitoring](https://www.apolloresearch.ai/monitoring/evaluating-llm-calibration-for-coding-agent-monitoring) (2026).
[^calibration]: Guo et al., [On Calibration of Modern Neural Networks](https://arxiv.org/abs/1706.04599) (2017); Apollo Research, [Evaluating LLM Calibration for Coding-Agent Monitoring](https://www.apolloresearch.ai/monitoring/evaluating-llm-calibration-for-coding-agent-monitoring) (2026).
[^internals]: E.g. Kadavath et al., [Language Models (Mostly) Know What They Know](https://arxiv.org/abs/2207.05221) (2022); Azaria & Mitchell, [The Internal State of an LLM Knows When It's Lying](https://arxiv.org/abs/2304.13734) (2023); Orgad et al., [LLMs Know More Than They Show](https://arxiv.org/abs/2410.02707) (2024); Radharapu et al., [Calibrating LLM Judges: Linear Probes for Fast and Reliable Uncertainty Estimation](https://arxiv.org/abs/2512.22245) (2025).
[^outputs]: E.g. Hendrycks & Gimpel, [A Baseline for Detecting Misclassified and Out-of-Distribution Examples](https://arxiv.org/abs/1610.02136) (2017); Lin et al., [Teaching Models to Express Their Uncertainty in Words](https://arxiv.org/abs/2205.14334) (2022); Farquhar et al., [Detecting hallucinations in large language models using semantic entropy](https://www.nature.com/articles/s41586-024-07421-0) (2024).
[^practice]: Lindner et al., [Practical challenges of control monitoring in frontier AI deployments](https://arxiv.org/abs/2512.22154) (2025).
[^linuxarena]: Tracy et al., [LinuxArena: A Control Setting for AI Agents in Live Production Software Environments](https://arxiv.org/abs/2604.15384) (2026).
[^gemma]: Google DeepMind, [Gemma 4 12B](https://huggingface.co/google/gemma-4-12B-it) (2026).
[^deepseek]: DeepSeek-AI, [DeepSeek-V4-Pro](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro) (preview release, April 2026); [DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence](https://arxiv.org/abs/2606.19348) (2026).
[^combining]: Hua et al., [Combining Cost-Constrained Runtime Monitors for AI Safety](https://arxiv.org/abs/2507.15886) (2025).
