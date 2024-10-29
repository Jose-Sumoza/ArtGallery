import { useState, useContext, useEffect } from "react";
import { GlobalState } from "@/GlobalState";
import Cards from "@components/Cards";
import Loading from "@components/Loading";
import BANNER from "@consts/banner";

const Banner = () => {
	return (
		<section>
			
			<div className='hidden dark:block absolute inset-0 left-0 w-full h-[105%] lg:h-[150%] blur-3xl overflow-hidden opacity-50 -z-10'>
				<figure className='w-full h-full'>
					<img
						src={ BANNER.imgUrl }
						draggable={ false }
						onContextMenu={ e => e.preventDefault() }
						className='w-full h-full object-cover [mask-image:linear-gradient(to_bottom,black_30%,transparent_90%)]'
					/>
				</figure>
			</div>

			<div className='flex items-end justify-start relative bg-gradient-to-t from-[rgba(0,0,0,.8)] from-0% to-50% rounded-2xl overflow-hidden'>
				
				<figure className='flex items-center aspect-square lg:aspect-[16/8.2] overflow-hidden -z-10'>
	
					<img
						src={ BANNER.imgUrl }
						alt="Portada de inicio"
						loading='eager'
						draggable={ false }
						onContextMenu={ e => e.preventDefault() }
						className="w-full h-full object-cover"
					/>
	
				</figure>
	
				<div className="flex flex-col absolute p-8 lg:p-10 w-full text-mercury-100 gap-2 lg:gap-0">
	
					<h2 className="text-[1.4rem] lg:text-[3.3rem] font-bold text-wrap">{ BANNER.title }</h2>
	
					<p className="text-sm lg:text-base lg:max-w-[70%]">{ BANNER.subtitle }</p>
	
				</div>
	
			</div>

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

		if (!res.success) {
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

		if (!res.success) {
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
	const { postsAPI, artistsAPI, useTheme } = state;

	return (
		<main className='flex flex-col'>

			<Banner />

			<section className="flex flex-col mt-16 [&_h3]:text-2xl [&_h3]:font-bold gap-16">
				<RecentPosts postsAPI={ postsAPI } useTheme={ useTheme } />
				<RecentArtists artistsAPI={ artistsAPI } useTheme={ useTheme }  />
			</section>

		</main>
	)
};