import Hero from '@/components/home/Header'
import News from '@/components/home/News'
import Section from '@/components/home/Section'
import Layout from '@/layouts/Layout'
import { User } from '@/lib/server/auth/AuthManager'
import BlogManager, { Blog } from '@/lib/server/blogs/BlogManager'
import AuthManager from '@/lib/server/auth/AuthManager'
import { PageProps } from '@/types'
import { GetServerSideProps } from 'next'
import React from 'react'
import Util from '@/lib/common/Util'
import Trailer from '@/components/home/Trailer'

type HomeProps = {
    lastBlog: Blog | null
} & PageProps

Home.getLayout = function getLayout(page: React.ReactNode, pageProps: PageProps) {
    return (
        <Layout
            title="IvyMC - Minecraft Sunucusu"
            description="IvyMC sunucusunda ikliminizi seçin ve dünyanızı inşa edin! Vahşi dünyada yaratıklarla savaşın!"
            ogDescription="IvyMC sunucusunda ikliminizi seçin ve dünyanızı inşa edin! Vahşi dünyada yaratıklarla savaşın!"
            user={pageProps.user}
        >
            {page}
        </Layout>
    )
}

export default function Home({ lastBlog }: HomeProps) {
    return (
        <>
            <Hero />
            <div className="flex flex-col gap-48 md:gap-24 sm:gap-16 mb-44 md:mb-20 sm:mb-12">
                <Trailer />
                <News lastBlog={lastBlog} />
                <Section
                    title="Discord Topluluğumuzun Bir Parçası Olun"
                    description="IvyMC Discord sunucumuza katılarak topluluğumuzun bir parçası olabilirsiniz. 
                    Sunucumuzda en son güncellemeleri, etkinlikleri ve daha fazlasını takip edebilirsiniz. 
                    Ayrıca, diğer oyuncularla sohbet edebilir, yeni arkadaşlıklar kurabilir ve 
                    harika vakit geçirebilirsiniz!"
                    image="/assets/home/guard.png"
                    imageAlt="Guard"
                    imageWidth={360}
                    imageHeight={360}
                    imagePosition="left"
                    discordButton
                />
                <Section
                    title="Rehberlerimiz Size Yardımcı Olabilir"
                    description="IvyMC Minecraft sunucusunda oynamaya başlamak için rehberlerimizi okuyabilirsiniz. 
                    Bu rehberler; sunucumuzdaki oyunun temelleri, özellikler ve daha fazlası hakkında size bilgi verebilir. 
                    Rehberlerimizi inceleyerek avantaj sağlayabilir ve oyun deneyiminizi daha keyifli hale getirebilirsiniz!"
                    image="/assets/home/guide.png"
                    imageAlt="Book"
                    imageWidth={360}
                    imageHeight={360}
                    imagePosition="right"
                    buttonText="Rehberlere Göz At"
                    buttonUrl="/rehber"
                />
            </div>
        </>
    )
}


export const getServerSideProps = (async (ctx) => {
    try {
        try {
            const blogs = BlogManager.getInstance().blogs;
            const lastBlog = blogs.length > 0 ? blogs[0] : null;
            return {
                props: {
                    lastBlog: lastBlog ? {
                        ...lastBlog,
                        description: Util.cleanMarkdown(lastBlog.attributes.description).slice(0, 400) + '...'
                    } : null,
                    user: await AuthManager.getInstance().getUserFromContext(ctx)
                }
            }
        } catch (blogError) {
            console.error('BlogManager error:', blogError);
            return {
                props: {
                    lastBlog: null,
                    user: await AuthManager.getInstance().getUserFromContext(ctx)
                }
            }
        }
    } catch (error) {
        console.error('Error in getServerSideProps:', error);
        return {
            props: {
                lastBlog: null,
                user: null
            }
        }
    }
}) satisfies GetServerSideProps<{ user: User | null, lastBlog: Blog | null }>