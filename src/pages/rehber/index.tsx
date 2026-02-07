import GuideCard from '@/components/guides/GuideCard'
import Layout from '@/layouts/Layout'
import AuthManager, { User } from '@/lib/server/auth/AuthManager'
import GuideManager, { Guide } from '@/lib/server/guides/GuideManager'
import { PageProps } from '@/types'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import React from 'react'

type GuidesProps = InferGetServerSidePropsType<typeof getServerSideProps> & PageProps


GuidesPage.getLayout = function getLayout(page: React.ReactNode, pageProps: PageProps) {
    return (
        <Layout
            title="IvyMC - Rehber"
            description="Minecraft sunucumuz hakkında bilgi alabileceğiniz rehber sayfası."
            ogDescription="Minecraft sunucumuz hakkında bilgi alabileceğiniz rehber sayfası."
            user={pageProps.user}
        >
            {page}
        </Layout>
    )
}

export default function GuidesPage({ guides, user }: GuidesProps) {
    return (
        <>
            <div className='mt-28 md:mt-20'>
                <div
                    data-aos="fade-down"
                    className='flex flex-col relative p-16 md:p-8 sm:p-6 rounded-lg shadow-lg bg-cover bg-center bg-no-repeat overflow-hidden'
                    style={{
                        backgroundImage: 'url(/assets/rehber/rehber-bg.png)'
                    }}>
                    <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg"></div>
                    <h1 className='text-4xl font-semibold text-center z-20 relative'>IvyMC Rehberler</h1>
                    <p className='text-center text-xl mt-4 z-20 relative'>Minecraft sunucumuz hakkında bilgi alabileceğiniz rehber sayfası.</p>
                </div>

                <div data-aos="fade-up"
                    className='mt-12 grid grid-cols-3 md:grid-cols-1 lg:grid-cols-2 gap-8'>
                    {
                        guides.map((guide, index) => (
                            <GuideCard key={index} guide={guide} />
                        ))
                    }
                </div>
            </div>
        </>
    )
}


export const getServerSideProps = (async (ctx) => {
    // Ensure guides are fetched (will use cache or fetch fresh data)
    const guides = await GuideManager.getInstance().getGuides();
    return {
        props: {
            guides: guides.map((guide) => {
                const newGuide: Guide = {
                    ...guide,
                    attributes: {
                        ...guide.attributes,
                        description: ''
                    }
                };
                return newGuide;
            }).reverse(),
            user: await AuthManager.getInstance().getUserFromContext(ctx)
        }
    }
}) satisfies GetServerSideProps<{ guides: Guide[], user: User | null }>