/**
 * PaperBackground — decorative background layer.
 *
 * Renders the text of "Attention Is All You Need" (Vaswani et al., 2017)
 * as a dense, two-column, faded academic texture behind pillar cards.
 * The text is not meant to be read — it's atmospheric wallpaper.
 *
 * Styled to mimic LaTeX Computer Modern output via the cm-web-fonts CDN.
 * Text is non-interactive (pointer-events: none, user-select: none).
 */

const PAPER_CONTENT = [
  {
    type: 'title',
    text: 'Attention Is All You Need',
  },
  {
    type: 'authors',
    text: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin',
  },
  {
    type: 'affiliation',
    text: 'Google Brain · Google Research · University of Toronto',
  },
  {
    type: 'heading',
    text: 'Abstract',
  },
  {
    type: 'body',
    text: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.0 after training for 3.5 days on eight GPUs, a small fraction of the training costs of the best models from the literature.',
  },
  {
    type: 'heading',
    text: '1   Introduction',
  },
  {
    type: 'body',
    text: 'Recurrent neural networks, long short-term memory [13] and gated recurrent [7] neural networks in particular, have been firmly established as state of the art approaches in sequence modeling and transduction problems such as language modeling and machine translation [35, 2, 5]. Numerous efforts have since continued to push the boundaries of recurrent language models and encoder-decoder architectures [38, 24, 15].',
  },
  {
    type: 'body',
    text: 'Recurrent models typically factor computation along the symbol positions of the input and output sequences. Aligning the positions to steps in computation time, they generate a sequence of hidden states hₜ, as a function of the previous hidden state hₜ₋₁ and the input for position t. This inherently sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths, as memory constraints limit batching across examples. Recent work has achieved significant improvements in computational efficiency through factorization tricks [21] and conditional computation [32], while also improving model performance in case of the latter. The fundamental constraint of sequential computation, however, remains.',
  },
  {
    type: 'body',
    text: 'Attention mechanisms have become an integral part of compelling sequence modeling and transduction models in various tasks, allowing modeling of dependencies without regard to their distance in the input or output sequences [2, 19]. In all but a few cases [27], however, such attention mechanisms are used in conjunction with a recurrent network.',
  },
  {
    type: 'body',
    text: 'In this work we propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality after being trained for as little as twelve hours on eight P100 GPUs.',
  },
  {
    type: 'heading',
    text: '2   Background',
  },
  {
    type: 'body',
    text: 'The goal of reducing sequential computation also forms the foundation of the Extended Neural GPU [16], ByteNet [18] and ConvS2S [9], all of which use convolutional neural networks as basic building block, computing hidden representations in parallel for all input and output positions. In these models, the number of operations required to relate signals from two arbitrary input or output positions grows in the distance between positions, linearly for ConvS2S and logarithmically for ByteNet. This makes it more difficult to learn dependencies between distant positions [12]. In the Transformer this is reduced to a constant number of operations, albeit at the cost of reduced effective resolution due to averaging attention-weighted positions, an effect we counteract with Multi-Head Attention as described in section 3.2.',
  },
  {
    type: 'body',
    text: 'Self-attention, sometimes called intra-attention is an attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence. Self-attention has been used successfully in a variety of tasks including reading comprehension, abstractive summarization, textual entailment and learning task-independent sentence representations [4, 27, 28, 22].',
  },
  {
    type: 'body',
    text: 'End-to-end memory networks are based on a recurrent attention mechanism instead of sequence-aligned recurrence and have been shown to perform well on simple-language question answering and language modeling tasks [34]. To the best of our knowledge, however, the Transformer is the first transduction model relying entirely on self-attention to compute representations of its input and output without using sequence-aligned RNNs or convolution. In the following sections, we will describe the Transformer, motivate self-attention and discuss its advantages over models such as [17, 18] and [9].',
  },
  {
    type: 'heading',
    text: '3   Model Architecture',
  },
  {
    type: 'body',
    text: 'Most competitive neural sequence transduction models have an encoder-decoder structure [5, 2, 35]. Here, the encoder maps an input sequence of symbol representations (x₁, ..., xₙ) to a sequence of continuous representations z = (z₁, ..., zₙ). Given z, the decoder then generates an output sequence (y₁, ..., yₘ) of symbols one element at a time. At each step the model is auto-regressive [10], consuming the previously generated symbols as additional input when generating the next.',
  },
  {
    type: 'body',
    text: 'The Transformer follows this overall architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder, shown in the left and right halves of Figure 1, respectively.',
  },
  {
    type: 'subheading',
    text: '3.1   Encoder and Decoder Stacks',
  },
  {
    type: 'body',
    text: 'Encoder: The encoder is composed of a stack of N = 6 identical layers. Each layer has two sub-layers. The first is a multi-head self-attention mechanism, and the second is a simple, position-wise fully connected feed-forward network. We employ a residual connection [11] around each of the two sub-layers, followed by layer normalization [1]. That is, the output of each sub-layer is LayerNorm(x + Sublayer(x)), where Sublayer(x) is the function implemented by the sub-layer itself. To facilitate these residual connections, all sub-layers in the model, as well as the embedding layers, produce outputs of dimension dₘₒdₑₗ = 512.',
  },
  {
    type: 'body',
    text: 'Decoder: The decoder is also composed of a stack of N = 6 identical layers. In addition to the two sub-layers in each encoder layer, the decoder inserts a third sub-layer, which performs multi-head attention over the output of the encoder stack. Similar to the encoder, we employ residual connections around each of the sub-layers, followed by layer normalization. We also modify the self-attention sub-layer in the decoder stack to prevent positions from attending to subsequent positions. This masking, combined with fact that the output embeddings are offset by one position, ensures that the predictions for position i can depend only on the known outputs at positions less than i.',
  },
  {
    type: 'subheading',
    text: '3.2   Attention',
  },
  {
    type: 'body',
    text: 'An attention function can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors. The output is computed as a weighted sum of the values, where the weight assigned to each value is computed by a compatibility function of the query with the corresponding key.',
  },
  {
    type: 'math',
    text: 'Attention(Q, K, V) = softmax(QKᵀ / √dₖ) V',
  },
  {
    type: 'body',
    text: 'We call our particular attention "Scaled Dot-Product Attention". The input consists of queries and keys of dimension dₖ, and values of dimension d_v. We compute the dot products of the query with all keys, divide each by √dₖ, and apply a softmax function to obtain the weights on the values. In practice, we compute the attention function on a set of queries simultaneously, packed together into a matrix Q. The keys and values are also packed together into matrices K and V. We compute the matrix of outputs as above.',
  },
  {
    type: 'body',
    text: 'The two most commonly used attention functions are additive attention [2], and dot-product (multiplicative) attention. Dot-product attention is identical to our algorithm, except for the scaling factor of 1/√dₖ. Additive attention computes the compatibility function using a feed-forward network with a single hidden layer. While the two are similar in theoretical complexity, dot-product attention is much faster and more space-efficient in practice, since it can be implemented using highly optimized matrix multiplication code.',
  },
  {
    type: 'subheading',
    text: '3.3   Position-wise Feed-Forward Networks',
  },
  {
    type: 'body',
    text: 'In addition to attention sub-layers, each of the layers in our encoder and decoder contains a fully connected feed-forward network, which is applied to each position separately and identically. This consists of two linear transformations with a ReLU activation in between. FFN(x) = max(0, xW₁ + b₁)W₂ + b₂. While the linear transformations are the same across different positions, they use different parameters from layer to layer. Another way of describing this is as two convolutions with kernel size 1. The dimensionality of input and output is dₘₒdₑₗ = 512, and the inner-layer has dimensionality d_ff = 2048.',
  },
  {
    type: 'subheading',
    text: '3.4   Embeddings and Softmax',
  },
  {
    type: 'body',
    text: 'Similarly to other sequence transduction models, we use learned embeddings to convert the input tokens and output tokens to vectors of dimension dₘₒdₑₗ. We also use the usual learned linear transformation and softmax function to convert the decoder output to predicted next-token probabilities. In our model, we share the same weight matrix between the two embedding layers and the pre-softmax linear transformation, similar to [30]. In the embedding layers, we multiply those weights by √dₘₒdₑₗ.',
  },
  {
    type: 'subheading',
    text: '3.5   Positional Encoding',
  },
  {
    type: 'body',
    text: 'Since our model contains no recurrence and no convolution, in order for the model to make use of the order of the sequence, we must inject some information about the relative or absolute position of the tokens in the sequence. To this end, we add "positional encodings" to the input embeddings at the bottoms of the encoder and decoder stacks. The positional encodings have the same dimension dₘₒdₑₗ as the embeddings, so that the two can be summed. There are many choices of positional encodings, learned and fixed [9].',
  },
  {
    type: 'body',
    text: 'In this work, we use sine and cosine functions of different frequencies: PE(pos, 2i) = sin(pos / 10000^(2i/dₘₒdₑₗ)), PE(pos, 2i+1) = cos(pos / 10000^(2i/dₘₒdₑₗ)). where pos is the position and i is the dimension. That is, each dimension of the positional encoding corresponds to a sinusoid. The wavelengths form a geometric progression from 2π to 10000 · 2π. We chose this function because we hypothesized it would allow the model to easily learn to attend by relative positions, since for any fixed offset k, PEpos+k can be represented as a linear function of PEpos.',
  },
  {
    type: 'heading',
    text: '4   Why Self-Attention',
  },
  {
    type: 'body',
    text: 'In this section we compare various aspects of self-attention layers to the recurrent and convolutional layers commonly used for mapping one variable-length sequence of symbol representations (x₁, ..., xₙ) to another sequence of equal length (z₁, ..., zₙ), with xᵢ, zᵢ ∈ ℝᵈ, such as a hidden layer in a typical sequence transduction encoder or decoder. Motivating our use of self-attention we consider three desiderata.',
  },
  {
    type: 'body',
    text: 'One is the total computational complexity per layer. Another is the amount of computation that can be parallelized, as measured by the minimum number of sequential operations required. The third is the path length between long-range dependencies in the network. Learning long-range dependencies is a key challenge in many sequence transduction tasks. One key factor affecting the ability to learn such dependencies is the length of the paths forward and backward signals have to traverse in the network. The shorter these paths between any combination of positions in the input and output sequences, the easier it is to learn long-range dependencies [12]. Hence we also compare the maximum path length between any two input and output positions in networks composed of the different layer types.',
  },
]

function PaperText() {
  const repeat = 2

  return (
    <div
      style={{
        fontFamily: '"Computer Modern Serif", "CMU Serif", Georgia, "Times New Roman", serif',
        fontSize: '10.5px',
        lineHeight: 1.65,
        color: '#1a1a1a',
        opacity: 0.18,
        columnCount: 2,
        columnGap: '2.4em',
        columnRule: '1px solid rgba(0,0,0,0.06)',
        userSelect: 'none',
        pointerEvents: 'none',
        padding: '40px 48px',
        textAlign: 'justify',
        hyphens: 'auto',
      }}
    >
      {Array.from({ length: repeat }).map((_, rep) =>
        PAPER_CONTENT.map((block, i) => {
          const key = `${rep}-${i}`
          if (block.type === 'title') return (
            <p key={key} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', marginBottom: '6px', columnSpan: 'all', breakBefore: rep === 0 ? 'auto' : 'column' }}>
              {block.text}
            </p>
          )
          if (block.type === 'authors') return (
            <p key={key} style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '11px', marginBottom: '2px', columnSpan: 'all' }}>
              {block.text}
            </p>
          )
          if (block.type === 'affiliation') return (
            <p key={key} style={{ textAlign: 'center', fontSize: '10px', marginBottom: '14px', columnSpan: 'all', color: '#555' }}>
              {block.text}
            </p>
          )
          if (block.type === 'heading') return (
            <p key={key} style={{ fontWeight: 'bold', fontSize: '12px', marginTop: '18px', marginBottom: '6px' }}>
              {block.text}
            </p>
          )
          if (block.type === 'subheading') return (
            <p key={key} style={{ fontWeight: 'bold', fontSize: '11px', marginTop: '12px', marginBottom: '4px' }}>
              {block.text}
            </p>
          )
          if (block.type === 'math') return (
            <p key={key} style={{ textAlign: 'center', fontStyle: 'italic', margin: '10px 0', letterSpacing: '0.01em' }}>
              {block.text}
            </p>
          )
          return (
            <p key={key} style={{ marginBottom: '8px' }}>
              {block.text}
            </p>
          )
        })
      )}
    </div>
  )
}

export function PaperBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        backgroundColor: '#f9f7f2',
        filter: 'blur(1.2px)',
      }}
    >
      {/* The dense paper text */}
      <PaperText />

      {/* No top fade — hero section shares the same background color */}

      {/* Bottom fade — blends into whatever section follows */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '140px',
          background: 'linear-gradient(to top, #ffffff 0%, transparent 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
