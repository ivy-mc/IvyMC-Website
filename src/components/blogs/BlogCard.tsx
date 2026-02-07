import Image from "next/image";
import React from "react";
import Link from "next/link";
import { Blog } from "@/lib/server/blogs/BlogManager";
import Util from "@/lib/common/Util";

type BlogCardProp = {
    blog: Blog
}

export default function BlogCard({ blog }: BlogCardProp) {
    return (
        <article className="h-full" data-aos="fade-up">
            <Link
                className="flex flex-col h-full rounded-lg overflow-hidden bg-dark-900 border border-dark-800 hover:border-dark-700 transition-all duration-300 hover:shadow-md group"
                href={`/haberler${blog.attributes.path}`}>
                {/* Görsel */}
                <div className="relative w-full h-48 overflow-hidden bg-dark-950">
                    <Image
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        src={blog.attributes.thumbnail}
                        alt="Blog Thumbnail"
                        width={750}
                        height={424}
                    />
                </div>
                
                {/* İçerik */}
                <div className="flex flex-col flex-1 p-4">
                    {/* Başlık */}
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-zinc-100 transition-colors">
                        {blog.attributes.title}
                    </h3>
                    
                    {/* Meta bilgi */}
                    <div className="text-xs text-zinc-500 mb-3">
                        <span className="font-semibold" style={{ color: Util.getBlogCategoryColor(blog.attributes.category) }}>
                            {blog.attributes.category}
                        </span>
                        <span className="mx-1">•</span>
                        <span>
                            {Util.dateToString(blog?.attributes.publishedAt ?? new Date())}
                        </span>
                    </div>
                    
                    {/* Açıklama */}
                    <p className="text-sm text-zinc-400 line-clamp-2 flex-1">
                        {Util.cleanMarkdown(blog.attributes.description).slice(0, 100)}...
                    </p>
                </div>
            </Link>
        </article>
    )
}
