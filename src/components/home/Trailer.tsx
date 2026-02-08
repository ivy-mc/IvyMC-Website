import React from "react";
import Image from "next/image";
import Button from "../common/Button";

export default function Trailer() {
    return (
        <section className="flex flex-col justify-center items-center space-y-8" data-aos="fade-up" data-offset="100">
            <div className="flex flex-col justify-center items-center">
                <h2 className="text-3xl font-semibold mb-3 text-center"
                >IvyMC'yi Keşfedin</h2>
                <p className="text-lg text-center text-zinc-400"
                >Sunucumuzun atmosferini hisset ve maceraya katıl!</p>
            </div>
            <div className="w-3/4 rounded-lg overflow-hidden shadow-lg md:w-full">
                <Image
                    src="/assets/profile/profile-bg.png"
                    alt="IvyMC Dünyası"
                    width={1200}
                    height={600}
                    className="w-full h-auto object-cover"
                    quality={100}
                />
            </div>
        </section>
    )
}