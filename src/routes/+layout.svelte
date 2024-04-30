<script lang="ts">

    import { browser } from "$app/environment";
    import { page } from "$app/stores";

    let darkTheme = browser
        ? window.matchMedia("(prefers-color-scheme: dark)").matches 
            ? true
            : false
        : false;

    // Determine the cannonical url by removing query params and using https
    let canonicalUrl: string;
    $: canonicalUrl = "https://".concat($page.url.host, $page.url.pathname);

</script>

<style lang="scss">

    :global(:root) {

        --color-dark: #1d1f21;
        --color-light: #ffffff;
        --color-accent-blue: #26afbf;
        --color-accent-orange: #F5B03E;

        --shadow: 0 0px 8px 0px rgba(0, 0, 0, 0.4);
        --shadow-text: 0 0px 4px var(--color-dark);

    }

    :global(.light) {
        --gradient-color: var(--color-light);
        color: var(--color-dark);
    }

    :global(.dark) {
        --gradient-color: var(--color-dark);
        color: var(--color-light);
    }

    :global(h1, h2, h3, h4, h5, h6) {
        font-family: 'Aclonica', sans-serif;
        font-weight: 400;
    }

    // Only add drop shadow to h1 if in dark theme
    // Looks blurry in light
    :global(.dark h1) {
        text-shadow: var(--shadow-text);
    }

    // Image formatting is fucked if we don't do this
    :global(img) {
        width: 100%;
    }

    main {
        // Make sure there's nothing under the footer
        min-height: 100vh;

    }

</style>

<svelte:head>

    <link rel="canonical" href={canonicalUrl}>

    <!-- OpenGraph data https://ogp.me/ -->
    <meta property="og:url" content={canonicalUrl}>
    <meta property="og:site_name" content="waffles.lol">

</svelte:head>

<main class:dark={darkTheme} class:light={!darkTheme}>
    <slot></slot>
</main>
