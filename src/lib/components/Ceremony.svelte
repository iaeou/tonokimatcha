<script lang="ts">
  import { ways } from '$lib/data/ways';
</script>

<!--
  All three ways stand open at once. They used to sit behind a selector, which
  hid two thirds of the argument: a visitor who never pressed "Cold" left
  believing this tea costs fifteen minutes.
-->
<div class="ways">
  {#each ways as way (way.id)}
    <article class="way" id={`way-${way.id}`}>
      <header class="way__head">
        <h3>{way.label}</h3>
        <p class="way__effort">{way.effort}</p>
      </header>

      <p class="way__kicker">{way.kicker}</p>

      <ol class="way__steps">
        {#each way.steps as step (step.numeral)}
          <li class="way__step">
            <p class="way__glyph" aria-hidden="true">{step.numeral}</p>
            <div>
              <p class="way__step-name">
                {step.name}
                <span class="way__japanese" lang="ja">{step.japanese}</span>
              </p>
              <p class="way__body">{step.body}</p>
            </div>
          </li>
        {/each}
      </ol>

      <p class="way__mark">{way.mark}</p>
    </article>
  {/each}
</div>
