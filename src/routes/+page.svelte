<script lang="ts">

    import { page } from "$app/stores";

    let bg = $page.data.af ? "/assets/background.webp" : "/assets/background.webp";
    let logo = $page.data.af ? "/assets/logo.webp" : "/assets/logo.webp";

</script>

<style lang="scss">

    .banner {

        background-size: cover;
        overflow: hidden;

        .inner {

            max-width: 800px;
            height: 100vh;
            margin: auto;

            display: flex;
            flex-direction: column;
            align-items: center;

            animation: 1s ease-out 0s 1 fadeIn;

            .content {

                padding: 48px;
                margin: auto;

                display: flex;
                flex-direction: column;
                align-items: center;
                z-index: 1;

                .logo {
                    max-width: 128px;
                }

                h1 {
                    margin-top: 24px;
                    font-size: 4em;
                }

                @media screen and (max-width: 550px) {

                    .logo {
                        max-width: 80px;
                    }

                    h1 {
                        font-size: 3em;
                    }

                }

            }

        }

    }

    .banner:before {

        content: "";
        position: absolute;
        width: 100%;
        height: 100%;

        background: linear-gradient(rgba(0, 0, 0, 0), var(--gradient-color));

        animation: 1s ease-out 0s 1 fadeIn;

    }

    @keyframes fadeIn {

        0% {
            opacity: 0;
            transform: translateY(+1%);
        }
        
        // Start adjusting opacity later to avoid flashing h1 color
        10% {
            opacity: 0;
        }

        100% {
            transform: translateY(0);
            opacity: 1;
        }
        
    }

</style>

<div class="banner" style="background-image: url({bg});">

    <div class="inner">

        <div class="content">

            <img class="logo" 
                src={logo} 
                alt="An emoji waffle in the shape of a heart. There is a pad of butter in the middle."/>
    
            <h1>waffles.lol</h1>

        </div>

    </div>

</div>
