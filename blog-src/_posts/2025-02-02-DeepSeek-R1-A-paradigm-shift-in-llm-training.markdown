---
layout: post
title: "DeepSeek-R1: A paradigm Shift in LLM Training"
date: 2025-02-02 16:13:45 +1100
categories: jekyll update
---

# DeepSeek-R1: A paradigm Shift in LLM Training

## Table of Contents

1. [Introduction](#10-introduction)
2. [Breaking away from Supervised Learning](#20-breaking-away-from-supervised-learning)
3. [Why this is significant](#30-why-this-is-significant)
4. [Reinforcement Learning the Reward Design](#40-reinforcement-learning-the-reward-design)
5. [Cold Start vs Hybrid Start: How DeepSeek Approached RL](#50-cold-start-vs-hybrid-start-how-deepseek-approached-rl)
6. [DeepSeek still faced challenges and Limitations](#60-deepseek-still-faced-challenges-and-limitations)
7. [Future Implications](#70-future-implications)
8. [Conclusion](#80-conclusion)

Original Paper: https://arxiv.org/abs/2501.12948

## 1.0 Introduction

DeepSeek R1 recently made waves in the research community, with the release of two LLM models: DeepSeek-R1 and DeepSeek-R1-Zero. Their latest paper, “Incentivising Reasoning Capability in LLMs via Reinforcement Learning” presents a significant shift in how large language models (LLMs) are able to develop reasoning abilities.

I took an in-depth look at their research, and there are some fascinating implications that shatter previous assumptions about how we train LLMs. Whilst DeepSeek-R1 itself is impressive, given their limited resources comparatively to the current state of the art, I won’t be focussing on just its raw capabilities and any political shifts that have subsequently occurred. Instead, I’ll be looking into the technical breakthroughs behind these models–particularly the use of reinforcement learning (RL) to develop reasoning without supervised fine-tuning (SFT). This shift could redefine how LLMs are trained in the future, allowing for autonomous, scalable and cost-efficient training. There are also some unsettling implications, with this breakthrough signalling the potential redundancy of human input in training state of the art LLMs.

## 2.0 Breaking away from Supervised Learning

Traditionally, models relied heavily of Supervised Fine-Tuning (SFT) as the primary method for training reasoning models. Roughly, this involved manually labelling explicit reasoning steps and feeding them into the model during training. While effective, SFT comes with some glaring limitations–being expense, time-consumption and scalability.

DeepSeek-R1-Zero took major strides in breaking this assumption down. R1-Zero completely eliminates SFT, demonstrating that reasoning can emerge through reinforcement learning (RL) alone. Instead of learning from pre-labelled reasoning examples, the model develops reasoning autonomously through an optimisation process.

DeepSeek’s core method of facilitating this breakthrough was through Guided Reward Policy Optimisation (GRPO). Unlike PPO (Proximal Policy Optimisation), which relies on a single critic model, GRPO estimates baseline rewards based on grouped outputs rather than evaluating them in isolation. This allows the model the gradually refine its reasoning skills over many iterations.

The specific reward system introduced in DeepSeek-R1-Zero was surprisingly simple and elegant, consisting of two primary components:

1. Accuracy rewards - Ensuring responses are correct
2. Format Rewards - Encouraging the model to structure its reasoning clearly using designated <think> and </think> tags.

I can’t emphasise enough how groundbreaking the shift from SFT to pure RL-driven training is in theory. It opens the door to fully autonomous AI training pipelines. Although there are advanced autonomous pipelines currently being developed by companies like Google and OpenAI, it can only benefit development to eliminate dependency on costly human annotated reasoning data. Not only does this make it cheaper and more scalable, but if I were to make an informed guess, it would also make the models better. By removing the need for labelled data, the model is free to discover reasoning strategies autonomously, which may lead to optimisations that human supervision may overlook. However this does increase the risk of suboptimal or erratic reasoning emerging during training.

The implications here are both fascinating and unsettling. Even the researchers expressed surprise at how effectively the models taught themselves without explicit guidance. In some cases, the model spontaneously corrected its own reasoning errors—a behaviour the authors noted as emerging naturally rather than being deliberately programmed. This was an interesting outcome—that advanced reasoning and self-correction can arise purely from reinforcement learning—and raises profound questions about the future of autonomous AI development. I may be over-exaggerating the implications, but you can’t help be a little concerned, with these realisations occurring multiple times throughout the paper.

From a purely technical perspective, this progress is exciting. It points further to a future where smaller-scale research teams could leverage reinforcement learning without the immense computational and data-labelling resources that traditional methods require. This could help in the movement to democratise AI research, making cutting-edge model development more accessible and less resource-intensive.

## 3.0 Why this is significant

As touched on previously, the reduced need for large-scale human labelling efforts is significant in that it can allow the LLMs to discover optimal reasoning patterns through trial and error. This isn’t without setbacks. DeepSeek’s team ran into multiple problems, including language mixing and other issues which is why they did not release R1-Zero as their flagship model. Most of these issues however where related too public usability. For human facing systems this is important, where understanding reasoning is an important consideration. I would be interested too see the performance of a model where a results based approach is prioritised.

Whilst DeepSeek-R1-Zero was a glimpse into the future of LLM development, it is still experimental, and underperformed compared to current state of the art LLMs including DeepSeek’s own R1 variant. Similar to R1-Zero, DeepSeek R1 prioritised RL to develop reasoning capabilities. However, it still employed SFT within its pre-training and post-training process, in a four step pipeline that ill outline below.

DeepSeek R1’s training pipeline consisted of the following phases.

- Phase 1: Cold Start

Unlike R1-Zero, DeepSeek R1 included a cold start phase where it was trained on a small carefully curated long CoT dataset (Chain of Thought). This training phase prioritised fixing the readability issues that R1-Zero faced. They achieved this dataset by gathering R1-Zero outputs in readable format, and refining the result through post-processing by human annotators.

- Phase 2: Reasoning-orientated Reinforcement Learning

After the cold start data, the same large-scale reinforcement learning training process used on R1-Zero was employed.

- Phase 3: Rejection Sampling and Supervised Fine-tuning

This phase aimed to train the model for general purpose application after reasoning skills were developed. Unlike the initial cold-start data which primarily focusses on reasoning, this stage incorporates data from other domains to enhance the model’s capabilities in writing, role-playing and other general purpose tasks.

- Phase 4: Reinforcement Learning for broader scenarios

The final stage further aligns the model with user-friendly preferences, they implemented a secondary reinforcement learning stage aimed at improving the model’s utility and harmlessness while simultaneously refining its reasoning capabilities.

The DeepSeek R1 model also was used to empower smaller models with reasoning capabilities. Specifically, they trained open-source models like Qwen (2024b) and Llama (AI@Meta 2024) using 800k samples curated with DeepSeek-R1. Their distillation method was fairly straightforward, but significantly enhanced the reasoning capabilities of smaller models. This is especially exciting for smaller scale research, where training and tuning smaller reasoning models on local architecture is more achievable. However, DeepSeek only trained the smaller models on SFT, and did not include an RL stage. This leaves a lot of opportunities for RL to be incorporated and improve the model’s effectiveness. For smaller-scale developers, this is exciting and i will be looking into the improving these models specifically in a later blog.

## 4.0 Reinforcement Learning the Reward Design

DeepSeek’s RL-based training represents the start of an industry shift away from SFT, relying instead on reward-driven optimisation. Unlike SFT, which trains models on explicitly labelled input-output pairs, RL assigns a reward score to outputs, allowing the model to iteratively refine its reasoning strategies.

Historically, applying RL to LLMs has been challenging due to several key issues:

- Scalability - Efficiently procuring and applying a robust reward model at scale
- Reward Hacking - AI exploiting loopholes in reward functions instead of genuinely improving its reasoning
- Cold Start Problem - Training entirely from scratch without pre-existing supervision is difficult and often unstable.

DeepSeek seems to have overcome these challenges by replacing the standard PPO (Proximal Policy Optimisation) framework (widely used in RLHF) with Group Relative Policy Optimisation (GRPO). PPO itself uses a single critic model, whereas GRPO refines reward signals by ranking outputs in groups rather than evaluating them individually. This ranking-based approach enhances the model’s ability to develop complex reasoning through reinforcement alone.

DeepSeek’s adoption of GRPO is central the R1-Zero model’s success, where it has learnt structured reasoning without any prior fine-tuning. This arks a significant departure from conventional training paradigms, and whilst there are still some work to be done for it too match the performance of its sibling model R1, this shift is still significant.

## 5.0 Cold Start vs Hybrid Start: How DeepSeek Approached RL

DeepSeek’s research introduced two distinct models as outlined–R1 and R1-Zero– with R1 being the flagship production model. While R1-Zero serves as proof of concept that reasoning can emerge purely from RL without any SFT, R1 follows a more structured approach (outlined in Section 3.0) leveraging SFT before RL to ensure performance consistency. This approach is analogous to the current state of the art training pipelines being used in America.

DeepSeek arbitrarily defines three key training approaches:

- Cold Start – No SFT at all, learning purely through RL (DeepSeek-R1-Zero).
- Hybrid Start – Minimal SFT with a small dataset before RL (not explicitly used in DeepSeek's models but relevant in broader AI research).
- Warm Start – Full SFT on reasoning tasks before RL (DeepSeek-R1).

DeepSeek-R1-Zero is revolutionary because it demonstrates that LLMs can develop reasoning through optimisation alone. However, it remains largely an experimental model rather than a practical, production-ready system. There is also still reliance on human-defined reward functions, meaning it isn’t entirely self-supervised, but still presents a major step in autonomous development. DeepSeek-R1, on the other hand, strikes a balance between scalability and stability, integrating SFT to ensure readability and usability while still benefiting from RL-driven reasoning improvements.

The public excitement surrounding DeepSeek’s release stems from its ability to train high-performance models without the massive costs traditionally associated with OpenAI’s top-tier models. However, it is essential to note that DeepSeek-R1 does not completely abandon SFT—it still undergoes a warm start, with supervised fine-tuning on a carefully curated set of long-chain-of-thought (CoT) data before reinforcement learning is applied.

This approach reflects a strategic tradeoff between efficiency and quality:

- DeepSeek-R1-Zero demonstrates that AI can self-improve without human intervention, but its outputs can be less readable and more prone to failure modes.
- DeepSeek-R1 ensures a balance of high-quality reasoning and practical usability, making it the actual production model.

This distinction is crucial in understanding DeepSeek’s practical impact—while the RL-only approach is a groundbreaking advancement, SFT is still an integral part of DeepSeek-R1’s success. It should be reiterated that DeepSeek’s models itself do not directly threaten the competitiveness of OpenAI’s models or other players in the industry. It is merely a signal that development of primary LLMs will be a more competitive space than previously thought. In my opinion, DeepSeek’s commitment to open-source AI–a vision once embodied by OpenAI before its shift to a closed source model–is a significant advantage to the global industry and a practice that should be more widely embraced. I hope that this signals the shift in global sentiments to adopt this same commitment.

## 6.0 DeepSeek still faced challenges and Limitations

Despite the impressive public success of DeepSeek-R1’s reasoning performance it still faces notable challenges, particularly when compared to its predecessor DeepSeek-V3. DeepSeek’s paper candidly acknowledges the limitations of their long CoT RL approach, where they highlighted key areas where both DeepSeek’s R1 and R1-Zero variants struggled.

For those that are less familiar, DeepSeek-V3 is DeepSeek’s previous flagship model, which differs from DeepSeek’s R1 model which is designed for reasoning-heavy tasks. Instead of being reasoning focussed, V3 is a general-purpose model and is analogous to OpenAi’s 4o series of models. Although i haven’t done any in depth research, the V3 model likely is optimised for multi-task performance, including dialogue, code generation, knowledge retrieval and various NLP benchmarks rather than long CoT reasoning.

The three most significant limitations i saw of R1 in comparison to V3 is as follows:

- General Capabilities – DeepSeek’s reasoning models struggle with function calling, multi-turn dialogue, and structured JSON output, making them less effective in some real-world applications.
- Language Mixing – While R1 improves upon R1-Zero in this regard, both models are optimised primarily for English and Chinese, occasionally leading to unintended language blending.
- Software Engineering Tasks – The long evaluation times of RL hinder performance on programming-related benchmarks. However, it should be noted that DeepSeek’s team has acknowledged this limitation and plans to incorporate rejection sampling in future iterations to improve efficiency.

Whilst not as prominent, there also where some other interesting limitations i noticed:

- Few-shot prompting degrades performance, which most general purpose models typically benefit from. DeepSeek’s team acknowledged that the model performs best with zero-shot prompting. The research team explicitly recommends this approach for optimal results.
- Reward hacking was also another issue. The use of a reward system in the RL process heightens the prevalence of these issues, where the model was found in training to exploit weaknesses in the scoring mechanisms rather than genuinely improving its reasoning. DeepSeek noted that human oversight and adversarial testing were necessary in order to mitigate this.

## 7.0 Future Implications

Whilst my excitement about DeepSeek’s latest release is largely due to the broader movement toward open-source AI, its most groundbreaking contribution lies in demonstrating the potential for self-evolving systems—a shift away from the heavy reliance on human oversight that previously defined LLM training.

This research signals a future where:

- Cheaper, more scalable reasoning models become feasible, lowering barriers for smaller development teams and further democratising AI model development.
- Reinforcement learning-driven reasoning continues to evolve, potentially surpassing the capabilities of models trained primarily through Supervised Fine-Tuning (SFT).
- AI systems could increasingly self-improve, reducing the need for constant human intervention in training and refinement.

If i were to guess, as reinforcement learning advances, it is likely that RL-trained reasoning models will eventually far exceed the capabilities of SFT-focused models, reshaping how AI reasoning is developed and scaled. But this is very much speculation and should be taken with a grain of salt, as this is an open and unanswered question still yet to be proven or disproven.

## 8.0 Conclusion

DeepSeek’s paper and reasoning models overall represents a significant shift in LLM training, with the R1-Zero experimental variant proving that reinforcement learning alone being capable of developing advanced reasoning capabilities–challenging the long-standing reliance on SFT. I still don’t believe OpenAi’s dominance in this space is currently threatened by any of these new releases, with the top-tier models still maintaining an edge in general capabilities, multi-turn dialogue and other task performance metrics. Anyhow, i am excited for a cultural shift this release presents, with a movement towards greater accessibility and competition in AI research.
