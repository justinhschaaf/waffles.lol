<!-- Sorry, that Waffle House has closed. -->

<style lang="scss">

    .banner {

        background-image: url("/assets/LCCN2010630838.webp");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: 100%;
        overflow: hidden;

        .inner {

            max-width: 800px;
            height: 100vh;
            margin-right: auto;

            display: flex;
            flex-direction: column;
            align-items: center;

            animation: 1s ease-out 0s 1 fadeIn;

            .content {

                padding: 48px;
                margin: auto;

                display: flex;
                flex-direction: column;
                align-items: left;
                z-index: 1;

                h1 {
                    font-size: 3.5em;
                }

                .wh {

                    background-color: var(--color-accent-orange);
                    color: var(--color-dark);

                    text-shadow: none;
                    font-size: 1.2em;
                    text-transform: uppercase;
                    
                }

            }

        }

    }

    .banner:before {

        content: "";
        position: absolute;
        width: 100%;
        height: 100%;

        background: linear-gradient(90deg, var(--gradient-color) 66%, rgba(0, 0, 0, 0));

    }

    @media screen and (max-width: 693px) {

        .banner {

            background-size: cover;

            .inner .content h1 {
                font-size: 2em;
            }

        }

        .banner:before {
            background: linear-gradient(rgba(0, 0, 0, 0), var(--gradient-color));
        }

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

<div class="banner">

    <div class="inner">

        <div class="content">

            <h1>sorry, that <br><span class="wh">Waffle House</span><br> has closed...</h1>

            <span><a href="/">go home</a></span>
            <span><a href="https://en.wikipedia.org/wiki/Waffle_House_Index" target="_blank">more info</a></span>

        </div>

    </div>

</div>
