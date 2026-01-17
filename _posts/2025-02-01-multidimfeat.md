---
layout: post
title: One-dimensional vs multi-dimensional features in interpretability
date: 2025-02-01
description: How to stop conflating with 768 dimensions
math: true
tag: ai
---

> Chris Olah's ["What is a Linear Representation? What is a Multidimensional Feature?"](https://transformer-circuits.pub/2024/july-update/index.html#linear-representations) (July Circuits Update) prompted a moment of pause for me regarding the term "one-dimensional feature." I initially conflated that phrase with the number of dimensions in the activation space (for example, the 768 dimensions in GPT‑2 Small). However, Olah uses "one-dimensional" to describe a property of the feature's structure - not the width of the activation vector. In this post, I clarify this distinction and explain the difference between one‑dimensional and multidimensional features in the context of SAEs and linear representations.

 
Here I explain the distinction between one‐dimensional and multidimensional features as they relate to SAEs and linear representations. It uses the example of colour representation and then relates the intuition back to neuron activations in SAEs.

# One‐Dimensional Features

Consider a simple scenario: representing colour using separate dimensions. One could imagine a network that has three independent directions in its activation space - a "redness" direction, a "greenness" direction, and a "blueness" direction.

In this model, each feature is a scalar value. The presence of a particular property (e.g. redness) is indicated by a number that scales the corresponding direction. Increasing the intensity of redness corresponds to moving further along the red direction. Feature composition is linear: 

\\[ \text{Activation} = x_{\text{red}}\,W_{\text{red}} + x_{\text{green}}\,W_{\text{green}} + x_{\text{blue}}\,W_{\text{blue}} \\]

Here, each \\(W\\) represents a fixed direction and each \\(x\\) is a single scalar value. This is the one‐dimensional case.

# Multidimensional Features

An alternative view is to represent colour as a point on a continuous "colour manifold." In this view, a colour is not defined solely by independent red, green, and blue scalars. Instead, it occupies a position in a multidimensional space where similar colours are nearby. For example, a circular disk could represent hues, with each point corresponding to a particular shade.

Any chosen point on this manifold defines a one‐dimensional "ray." Scaling the chosen point (multiplying by a scalar) produces a change in intensity without leaving the ray. In effect, the multidimensional feature supports the same operations as a one‐dimensional feature along any fixed direction through the manifold. The network may represent an infinite collection of one‐dimensional features corresponding to different positions on the manifold.

<figure>
  <img src="/images/manifold.png" alt="Multidimensional colour feature diagram" style="width: 100%; height: auto;">
  <figcaption>
    A multidimensional colour feature in activation space. Individual points on the circular manifold correspond to different colours. Each point defines a ray (shown in red, green, and blue) that represents different intensities of that specific colour. The concentric ellipses show how the entire feature scales together while maintaining its structure. This demonstrates how a multidimensional feature can still exhibit linear behaviour <em>when the ray is fixed</em> - both in composition (adding features) and intensity (scaling along rays).
  </figcaption>
</figure>

A multidimensional colour feature in activation space. Individual points on the circular manifold correspond to different colours. Each point defines a ray (shown in red, green, and blue) that represents different intensities of that specific colour. The concentric ellipses show how the entire feature scales together while maintaining its structure. This demonstrates how a multidimensional feature can still exhibit linear behaviour when the ray is fixed - both in composition (adding features) and intensity (scaling along rays).

# Application to SAEs

SAEs are typically trained to produce sparse, independent features. Each neuron's activation is a scalar, representing a one‐dimensional feature. In practice, however, several neurons may activate together in a structured way. Analysis may reveal that neurons can consistently fire together, potentially indicating a latent, multidimensional feature. When plotted, the activation vectors of such neurons could form a continuous shape in activation space. Furthermore, if scaling the co-activations produces a clear change in intensity while preserving the geometric structure, the behaviour is analogous to scaling along a ray in a multidimensional manifold.

This approach implies that even though individual neurons provide one‐dimensional signals, groups of neurons can be interpreted as sampling a continuous manifold. In that sense, one can think of a multidimensional feature as a collection of one‐dimensional features arranged in a continuous geometric structure.

# Implications for Probing and Interpretation

Probing techniques that extract linear directions remain valid even in the presence of multidimensional features. When one is interested in a specific property (for example, a particular shade of orange on a colour disk), a probe can lock onto the corresponding one‐dimensional ray within the overall manifold. The linear behaviour - composition by addition and intensity by scaling - persists on the ray even if the full feature is multidimensional.

<div style="margin: 4em 0;"></div>

Hopefully this explanation clarified how one can reconcile the idea of linear representations with the possibility of multidimensional features, particularly given confusion around the actual dimensionality of the activation space being conflated with "one-dimensional feature". 