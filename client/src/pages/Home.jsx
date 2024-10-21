import { useState, useContext, useEffect } from "react";
import { GlobalState } from "@/GlobalState";
import Cards from "@components/Cards";
import Loading from "@components/Loading";
import BANNER from "@consts/banner";

const Banner = () => {
	return (
		<section className='flex items-end justify-start relative bg-gradient-to-t from-[rgba(0,0,0,.8)] from-0% to-50% rounded-2xl overflow-hidden'>
			
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

			<div className="flex flex-col absolute p-8 lg:p-10 w-full text-black-haze gap-2 lg:gap-0">

				<h2 className="text-[1.4rem] lg:text-[3.3rem] font-bold text-wrap">{ BANNER.title }</h2>

				<p className="text-sm lg:text-base lg:max-w-[70%]">{ BANNER.subtitle }</p>

			</div>

		</section>
	);
};

const RecentPosts = ({ postsAPI }) => {
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
			<h3>Colecciones Recientes</h3>
			{
				loading ?
					<div className='flex items-center justify-center w-full'>
						<Loading size="100" color="var(--color-primary)" stroke="5" />
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
						<p className="text-lg font-normal">{ posts.content }</p>
			}
		</article>
	);
};

const RecentArtists = ({ artistsAPI }) => {
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
					<div className='flex items-center justify-center w-full'>
						<Loading size="100" color="var(--color-primary)" stroke="5" />
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
						<p className="text-lg font-normal">{ artists.content }</p>
			}
		</article>
	);
};

export const Home = () => {
	const state = useContext(GlobalState);
	const { postsAPI, artistsAPI } = state;

	return (
		<main className='flex flex-col'>

			<Banner />

			<section className="flex flex-col mt-8 [&_h3]:text-2xl [&_h3]:font-bold gap-16">
				<RecentPosts postsAPI={ postsAPI } />
				<RecentArtists artistsAPI={ artistsAPI } />
			</section>

		</main>
	)
};