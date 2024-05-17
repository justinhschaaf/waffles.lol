import { error, type RequestHandler } from "@sveltejs/kit";
import { hashicon } from "@emeraldpay/hashicon";
import { createCanvas, type Canvas } from "canvas";

export const GET: RequestHandler = ({ params }) => {

    return new Promise((resolve) => {

        if (params.hash == undefined) {
            resolve(new Response("Hash not specified.", { status: 400 }));
        } else {

            // @ts-ignore 
            let icon: Canvas = hashicon(params.hash, { createCanvas: createCanvas }); 
            icon.toBuffer((err, res) => {
        
                if (err != null) {
                    resolve(new Response("Image could not be created from canvas.", { status: 500 }));
                } else {
                    resolve(new Response(new Blob([res.buffer], { type: "image/png" })));
                }
        
            }, "image/png");

        }

    });

}

export const fallback: RequestHandler = () => {
    error(501);
}
