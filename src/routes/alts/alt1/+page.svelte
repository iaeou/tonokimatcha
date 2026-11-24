<svelte:head>
  <title>A Cup Full of Worlds · Matcha Tonoki</title>
  <meta name="description" content="Matcha Tonoki’s organic first-flush matcha, introduced by Wa, an original drawing by Yoshi Sislay." />
</svelte:head>

<section class="opening" aria-labelledby="opening-title">
  <div class="opening-copy">
    <h1 id="opening-title">A cup<br /> full of<br /> worlds.</h1>
    <p>Organic first-flush matcha<br class="desktop-break" /> from Kagoshima, Japan.</p>
    <a class="discover" href="#the-leaf">Discover the tea</a>
  </div>
  <figure>
    <img
      src="/images/figures/wa.webp"
      srcset="/images/figures/wa-480.webp 480w, /images/figures/wa.webp 565w"
      sizes="(max-width: 47rem) 78vw, 43vw"
      width="565"
      height="872"
      fetchpriority="high"
      alt="Wa, a smiling figure with a headdress full of flowers and insects"
    />
    <figcaption>Wa · Yoshi Sislay</figcaption>
  </figure>
</section>

<section class="leaf" id="the-leaf" aria-labelledby="leaf-title">
  <div class="leaf-copy">
    <span>The Leaf</span>
    <h2 id="leaf-title">One field. One harvest. One tea.</h2>
    <p>Organic first-flush leaf from the shaded fields of Kagoshima, stone-milled and held to a single standard. Whisk it in a bowl or shake it in a bottle. It is the same two grams.</p>
    <a href="/#collection">Explore the leaf</a>
  </div>
  <img src="/images/home-header2.webp" width="1916" height="821" loading="lazy" decoding="async" alt="A mound of matcha powder beside a tea bowl" />
</section>

<style>
  .opening {
    display: grid;
    grid-template-columns: 43% 57%;
  }

  .opening-copy {
    padding: clamp(2.2rem, 5.2vw, 5.3rem) 1.5rem clamp(2.4rem, 6vw, 6rem) var(--alt-gutter);
    background: var(--alt-paper);
  }

  h1,
  h2 {
    margin: 0;
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-weight: 600;
  }

  h1 {
    font-size: clamp(4.4rem, 9.4vw, 9.1rem);
    line-height: 0.87;
    letter-spacing: -0.045em;
  }

  .opening-copy p {
    margin: clamp(1.25rem, 2.5vw, 2.4rem) 0;
    font-size: clamp(1rem, 1.65vw, 1.55rem);
    line-height: 1.36;
  }

  .discover {
    display: inline-flex;
    align-items: center;
    padding: 0.8rem clamp(1.15rem, 2.8vw, 2.65rem);
    min-height: 2.75rem;
    color: white;
    background: var(--alt-leaf);
    font-size: clamp(1rem, 1.55vw, 1.42rem);
    font-weight: 600;
  }

  .discover:hover {
    background: #163713;
  }

  figure {
    position: relative;
    overflow: hidden;
    margin: 0;
    border-inline-start: 1px solid #838a62;
    background: #f9f6ef;
  }

  figure img {
    display: block;
    position: absolute;
    top: -1.65rem;
    inset-inline-start: 46.5%;
    transform: translateX(-50%);
    width: min(74%, 43rem);
    height: auto;
  }

  figcaption {
    position: absolute;
    right: clamp(0.7rem, 2vw, 1.8rem);
    bottom: clamp(0.6rem, 2vw, 1.8rem);
    padding: 0.18rem 0.35rem;
    background: #f9f6ef;
    font-size: clamp(0.72rem, 0.98vw, 0.95rem);
    font-style: italic;
  }

  .leaf {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    background: #f7f1e4;
  }

  .leaf-copy {
    padding: clamp(1.7rem, 2.8vw, 2.9rem) var(--alt-gutter);
  }

  .leaf span {
    display: block;
    margin-block-end: 0.25rem;
    color: var(--alt-leaf);
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  h2 {
    font-size: clamp(2.2rem, 4.1vw, 4.3rem);
    letter-spacing: -0.035em;
    line-height: 1;
  }

  .leaf p {
    max-width: 63ch;
    margin: 0.85rem 0 0.5rem;
    font-size: clamp(1rem, 1.24vw, 1.2rem);
  }

  .leaf a {
    display: inline-flex;
    min-height: 2.75rem;
    align-items: center;
    color: var(--alt-leaf);
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .leaf img {
    position: absolute;
    z-index: -1;
    inset: 0 0 0 auto;
    width: 43%;
    height: 100%;
    object-fit: cover;
    object-position: 79% center;
    mix-blend-mode: multiply;
    mask-image: linear-gradient(90deg, transparent, black 44%);
  }

  @media (max-width: 63rem) {
    .leaf p {
      max-width: 49ch;
    }
  }

  @media (max-width: 47rem) {
    .opening {
      grid-template-columns: 1fr;
    }

    .opening-copy {
      padding-inline: var(--alt-gutter);
    }

    h1 {
      font-size: clamp(3.9rem, 13vw, 6.4rem);
    }

    h1 br,
    .desktop-break {
      display: none;
    }

    figure {
      min-height: clamp(20rem, 98vw, 34rem);
      border-inline-start: 0;
      border-block-start: 1px solid #838a62;
    }

    figure img {
      top: 0;
      inset-inline-start: 50%;
      width: min(78%, 27rem);
    }

    .leaf img {
      position: static;
      display: block;
      width: 100%;
      height: auto;
      mask-image: none;
    }
  }
</style>
