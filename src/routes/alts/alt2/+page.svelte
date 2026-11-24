<script lang="ts">
  import { resolve } from '$app/paths';
  import { ways } from '$lib/data/ways';

  const introductions = [
    {
      id: 'cold',
      figure: 'oriental',
      alt: 'Oriental, a smiling figure with long hair and a necklace',
      width: 669,
      height: 910,
      summary: 'Two grams. Cold water. Fifteen seconds.'
    },
    {
      id: 'hot',
      figure: 'samurai',
      alt: 'Samurai, a smiling figure with an intricately decorated helmet',
      width: 671,
      height: 797,
      summary: 'Two grams. Warm water. A quick stir.'
    },
    {
      id: 'ceremony',
      figure: 'wa',
      alt: 'Wa, a smiling figure with a headdress full of flowers and insects',
      width: 565,
      height: 872,
      summary: 'Two grams. A warm bowl. A bamboo whisk.'
    }
  ];
  const choices = introductions.map((intro) => ({
    ...intro,
    label: ways.find((way) => way.id === intro.id)?.label ?? intro.id
  }));
  let selected = $state(choices[0]);
</script>

<svelte:head>
  <title>How Do You Take a Moment? · Matcha Tonoki</title>
  <meta name="description" content="One organic first-flush matcha from Kagoshima. Discover three ways to prepare it, with drawings by Yoshi Sislay." />
</svelte:head>

<section class="opening" aria-labelledby="moment-title">
  <div class="intro">
    <h1 id="moment-title">How do you take a moment?</h1>
    <p>One organic first-flush matcha from Kagoshima. Three ways to make it yours.</p>
  </div>

  <figure>
    <div class="portraits">
      {#each choices as choice (choice.id)}
        <img
          src={`/images/figures/${choice.figure}.webp`}
          srcset={`/images/figures/${choice.figure}-480.webp 480w, /images/figures/${choice.figure}.webp ${choice.width}w`}
          sizes="(max-width: 39rem) 29vw, 26vw"
          width={choice.width}
          height={choice.height}
          fetchpriority={choice.id === 'hot' ? 'high' : undefined}
          alt={choice.alt}
        />
      {/each}
    </div>
    <figcaption>Drawings by<br /> Yoshi Sislay</figcaption>
  </figure>

  <fieldset>
    <legend class="visually-hidden">Choose a preparation</legend>
    {#each choices as choice (choice.id)}
      <label>
        <input class="visually-hidden" type="radio" name="preparation" value={choice} bind:group={selected} />
        <span>{choice.label}</span>
      </label>
    {/each}
  </fieldset>
</section>

<section class="preparation" aria-label="Preparation preview">
  <div class="summary" aria-live="polite">
    <h2>{selected.label}</h2>
    <p>{selected.summary}</p>
  </div>
  <a href={`${resolve('/')}#way-${selected.id}`} aria-label={`See how to prepare ${selected.label.toLowerCase()} matcha`}>
    See how <span aria-hidden="true">→</span>
  </a>
</section>

<style>
  .opening {
    --accent: #c9ef07;
    text-align: center;
  }

  .intro {
    padding: clamp(1.7rem, 3.2vw, 3.2rem) var(--alt-gutter) 0;
  }

  h1,
  h2 {
    margin: 0;
    font-family: inherit;
    font-weight: 800;
    letter-spacing: -0.055em;
  }

  h1 {
    font-size: clamp(2.5rem, 6.05vw, 6rem);
    line-height: 1;
    text-wrap: balance;
  }

  .intro p {
    margin: clamp(0.7rem, 1.4vw, 1.3rem) auto 0;
    font-size: clamp(1rem, 1.7vw, 1.5rem);
    line-height: 1.4;
    text-wrap: balance;
  }

  figure {
    position: relative;
    margin: clamp(1.25rem, 2.6vw, 2.5rem) 0 0;
    padding-inline: 8.3%;
  }

  .portraits {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: end;
    gap: clamp(0.5rem, 2vw, 2rem);
  }

  .portraits img {
    display: block;
    width: 100%;
    height: clamp(13rem, 34vw, 33rem);
    object-fit: contain;
    object-position: center bottom;
  }

  figcaption {
    position: absolute;
    right: clamp(0.6rem, 2.65vw, 2.4rem);
    bottom: 0.8rem;
    font-size: clamp(0.71rem, 1.05vw, 1rem);
    line-height: 1.25;
    text-align: left;
  }

  fieldset {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    justify-items: center;
    align-items: center;
    width: min(100%, 55rem);
    min-inline-size: 0;
    margin: 0 auto;
    padding: clamp(0.95rem, 2.4vw, 2.35rem) var(--alt-gutter);
    border: 0;
  }

  label {
    position: relative;
    display: inline-flex;
    cursor: pointer;
    font-size: clamp(1.1rem, 2.9vw, 2.8rem);
    line-height: 1.2;
  }

  label span {
    display: flex;
    align-items: center;
    min-height: 2.75rem;
    padding: 0.45rem 0.26em;
    border-bottom: 0.22em solid transparent;
  }

  label:hover span {
    border-color: #e3e3da;
  }

  input:checked + span {
    border-color: var(--accent);
    font-weight: 800;
  }

  input:focus-visible + span {
    outline: 2px solid #22511d;
    outline-offset: 3px;
  }

  .visually-hidden {
    position: absolute;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    border: 0;
  }

  .preparation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem 2rem;
    padding: clamp(1rem, 1.7vw, 1.8rem) var(--alt-gutter);
    background: #c9ef07;
  }

  .summary {
    display: flex;
    align-items: center;
    gap: clamp(0.65rem, 3.4vw, 3.2rem);
  }

  h2 {
    font-size: clamp(1.75rem, 4vw, 3.65rem);
    line-height: 1;
  }

  .summary p {
    margin: 0;
    padding-inline-start: clamp(0.65rem, 3.4vw, 3.2rem);
    border-inline-start: 1px solid currentColor;
    font-size: clamp(1rem, 2vw, 1.8rem);
    line-height: 1.3;
  }

  .preparation a {
    display: inline-flex;
    gap: 0.5em;
    align-items: center;
    min-height: 2.75rem;
    white-space: nowrap;
    font-size: clamp(1.05rem, 2vw, 1.8rem);
    font-weight: 800;
  }

  .preparation a:hover {
    text-decoration: underline;
    text-underline-offset: 0.16em;
  }

  @media (max-width: 47rem) {
    figure {
      padding-inline: 4%;
    }

    .portraits img {
      height: clamp(8rem, 43vw, 18rem);
    }

    figcaption {
      position: static;
      margin-top: 0.5rem;
      text-align: right;
    }

    figcaption br {
      display: none;
    }
  }

  @media (max-width: 39rem) {
    fieldset {
      padding-inline: 0.5rem;
    }

    .preparation {
      flex-wrap: wrap;
    }

    .summary {
      width: 100%;
    }

    .summary h2 {
      min-width: 4ch;
    }
  }
</style>
