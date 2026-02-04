import Button from '@/components/common/Button'
import RankCard from '@/components/store/RankCard'
import Layout from '@/layouts/Layout'
import Util from '@/lib/common/Util'
import AuthManager, { User } from '@/lib/server/auth/AuthManager'
import RanksManager, { PublicRank } from '@/lib/server/store/RanksManager'
import { PageProps } from '@/types'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import React, { useRef } from 'react'

type RanksProps = InferGetServerSidePropsType<typeof getServerSideProps> & PageProps

RanksPage.getLayout = function getLayout(page: React.ReactNode, pageProps: RanksProps) {
    return (
        <Layout
            title="IvyMC - Rütbeler"
            description='Sunucumuzda bulunan rütbeleri inceleyin ve avantajları keşfedin.'
            ogDescription="Sunucumuzda bulunan rütbeleri inceleyin ve avantajları keşfedin."
            user={pageProps.user}
        >
            {page}
        </Layout>
    )
}

export default function RanksPage({ user, ranks }: RanksProps) {
    const router = useRouter();

    const containerRef = useRef<HTMLDivElement>(null);


    function disableScroll() {
        // Get the current page scroll position
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

        // if any scroll is attempted,
        // set this to the previous value
        window.onscroll = function () {
            window.scrollTo(scrollLeft, scrollTop);
        };
    }

    function enableScroll() {
        window.onscroll = function () { };
    }

    const handleScroll = (e: any) => {
        if (e.deltaY !== 0) {
            if (!containerRef.current) return;
            containerRef.current.scrollLeft += e.deltaY * 2.5;
        }
    };

    const privileges = ranks.map(rank => {
        return {
            ...rank.attributes.privileges,
            buttonId: Util.slugify(rank.attributes.title) + "_buy"
        }
    });

    return (
        <>
            <div className='mt-28' data-aos="fade-down">
                <div
                    className='flex flex-col relative py-16 px-12 md:p-12 rounded-lg shadow-lg 
                    bg-cover bg-center bg-no-repeat overflow-hidden
                    md:items-center'
                    style={{
                        backgroundImage: `url("https://res.cloudinary.com/dkcpwrjza/image/upload/v1768598806/magaza_bg_cd740627c7.png")`
                    }}>
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg"></div>
                    
                    <h1 className='text-4xl md:text-center font-semibold z-20 relative'>
                        IvyMC Rütbeler
                    </h1>
                    <p className='text-xl md:text-center mt-4 z-20 relative'>
                        Sunucumuzda bulunan rütbeleri inceleyin ve avantajları keşfedin.
                    </p>
                    {user &&
                        <Button blank type="link" href="/kredi-yukle" className="z-20 mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 w-fit md:m-0 md:mt-4 relative">Kredi Yükle</Button>
                    }
                </div>
            </div>

            <div className='mt-12 grid grid-cols-2 lg:grid-cols-1 gap-8'>
                {
                    ranks.filter(rank => rank.attributes.credit_market_id !== "player").map((rank, index) =>
                        <RankCard
                            key={index}
                            title={rank.attributes.title}
                            price={rank.attributes.price!}
                            credit_market_id={rank.attributes.credit_market_id}
                            user={user}
                            discount={
                                !rank.attributes.discount_percentage || !rank.attributes.discount_end_date
                                    ? undefined :
                                    {
                                        percentage: rank.attributes.discount_percentage,
                                        end_date: rank.attributes.discount_end_date
                                    }}
                            icon={rank.attributes.icon.data.attributes.url}
                            privileges={rank.attributes.privileges}
                        />
                    )
                }
            </div>
        </>
    )
}


export const getServerSideProps = (async (ctx) => {
    // Ensure ranks are fetched (will use cache or fetch fresh data)
    await RanksManager.getInstance().getRanks();
    return {
        props: {
            user: await AuthManager.getInstance().getUserFromContext(ctx),
            ranks: RanksManager.getInstance().getPublicRanks()
        }
    }
}) satisfies GetServerSideProps<{ user: User | null, ranks: PublicRank[] }>