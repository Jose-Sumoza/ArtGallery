import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { GlobalState } from "@/GlobalState";
import Cards from "@components/Cards";
import Loading from "@components/Loading";
import BANNER from "@consts/banner";
import { Link as LinkIcon } from '@icons';

const Banner = ({ useTheme, postsAPI }) => {
	const { isDark } = useTheme;
	const [ post, setPost ] = useState(null);
	const [ loading, setLoading ] = useState(true);
	const { getFeatured } = postsAPI;

	const fetchFeatured = async () => {
		const res = await getFeatured();

		if (!res?.success) return setLoading(false);

		setPost(res.content);
		setLoading(false);
	};

	useEffect(() => {
		fetchFeatured();
	}, []);

	return (
		<section className='aspect-square lg:aspect-[16/8.2]'>

			{
				loading ?
					<div className="flex items-center justify-center w-full h-full">
						<Loading size="100" color={ isDark ? 'var(--bg-color)' : 'var(--color-primary)' } stroke="5" />
					</div>
				:
			
					<>

						<div className='hidden dark:block absolute top-0 left-0 w-full h-[50%] lg:h-[55%] [mask-image:linear-gradient(to_bottom,black_0%,transparent_100%)] overflow-hidden opacity-50 -z-10'>
							<figure className='w-full h-full'>
								<img
									src={ post ? post.images[0].url : BANNER.imgUrl }
									draggable={ false }
									onContextMenu={ e => e.preventDefault() }
									className='w-full h-full object-cover blur-3xl'
								/>
							</figure>
						</div>
						
						<div className='flex items-end justify-start relative bg-gradient-to-t from-[rgba(0,0,0,.8)] from-0% to-50% rounded-2xl overflow-hidden'>
						
							<figure className='flex items-center aspect-square lg:aspect-[16/8.2] overflow-hidden -z-10'>
				
								<img
									src={ post ? post.images[0].url : BANNER.imgUrl }
									alt="Portada de inicio"
									loading='eager'
									draggable={ false }
									onContextMenu={ e => e.preventDefault() }
									className="w-full h-full object-cover"
								/>
				
							</figure>
				
							<div className="flex flex-col absolute p-8 lg:p-10 w-full text-mercury-100 gap-2 lg:gap-0">
				
								<h2 className="text-[1.4rem] lg:text-[3.3rem] font-bold text-wrap">{ post ? post.title : BANNER.title }</h2>
				
								<p className="text-sm lg:text-base lg:max-w-[70%]">{ post ? post.description : BANNER.subtitle }</p>

								{
									post ?
										<Link
											to={ `/posts/${ post._id }` }
											data-tooltip-content="Más detalles de la obra"
											data-tooltip-place='bottom'
											data-tooltip-id='my-tooltip'
											aria-label="Más detalles de la obra"
											className='flex items-center justify-center mt-1 p-1 pl-0 w-fit !text-accent-500 font-medium gap-2 hover:underline'
										>
											Ver más <LinkIcon className='w-4'/>
										</Link>
									:
										null
								}
				
							</div>
				
						</div>

					</>
			}

		</section>
	);
};

const RecentPosts = ({ useTheme, postsAPI }) => {
	const { isDark } = useTheme;
	const [ posts, setPosts ] = useState(null);
	const [ loading, setLoading ] = useState(true);
	const { posts: [ ,, getPosts ] } = postsAPI;

	const fetchPosts = async () => {
		const res = await getPosts({ limit: 4 });

		if (!res?.success) {
			setLoading(false);
			return setPosts(res);
		};

		setLoading(false);
		setPosts(res);
	};

	useEffect(() => {
		fetchPosts();
	}, []);

	return (
		<article className="flex flex-col items-start justify-start gap-8">
			<h3>Obras Recientes</h3>
			{
				loading ?
					<div className='flex items-center justify-center py-[100px] w-full'>
						<Loading size="100" color={ isDark ? 'var(--bg-color)' : 'var(--color-primary)' } stroke="5" />
					</div>
				:
					posts?.content?.docs?.length ?
						<Cards
							data={ posts.content.docs }
							type='post'
							title
							subtitle
							author
							className='grid lg:grid-cols-4 gap-8'
						/>
					:
						<div className="flex items-center justify-center w-full h-[300px]">
							<p className="text-2xl font-normal text-bunker-500/50">{ posts.content }</p>
						</div>
			}
		</article>
	);
};

const RecentArtists = ({ useTheme, artistsAPI }) => {
	const { isDark } = useTheme;
	const [ artists, setArtists ] = useState(null);
	const [ loading, setLoading ] = useState(true);
	const { artists: [ ,, getArtists ] } = artistsAPI;

	const fetchArtists = async () => {
		const res = await getArtists({ limit: 4 });

		if (!res?.success) {
			setLoading(false);
			return setArtists(res);
		};

		setLoading(false);
		setArtists(res);
	};

	useEffect(() => {
		fetchArtists();
	}, []);

	return (
		<article className="flex flex-col items-start justify-start gap-8">
			<h3>Artistas Recientes</h3>
			{
				loading ?
					<div className='flex items-center justify-center py-[100px] w-full'>
						<Loading size="100" color={ isDark ? 'var(--bg-color)' : 'var(--color-primary)' } stroke="5" />
					</div>
				:
					artists?.content?.docs?.length ?
						<Cards
							data={ artists.content.docs }
							type='artist'
							title
							subtitle
							className='grid lg:grid-cols-4 gap-8'
						/>
					:
						<div className="flex items-center justify-center w-full h-[300px]">
							<p className="text-2xl font-normal text-bunker-500/50">{ artists.content }</p>
						</div>
			}
		</article>
	);
};

export const Home = () => {
	const state = useContext(GlobalState);
	const { postsAPI, artistsAPI, useTheme, token } = state;

	return (
		<main className='flex flex-col'>

			<Banner postsAPI={ postsAPI } useTheme={ useTheme } />

			<section className="flex flex-col mt-16 [&_h3]:text-2xl [&_h3]:font-bold gap-16">
				<RecentPosts postsAPI={ postsAPI } useTheme={ useTheme } />
				<RecentArtists artistsAPI={ artistsAPI } useTheme={ useTheme }  />
			</section>

		</main>
	)
};