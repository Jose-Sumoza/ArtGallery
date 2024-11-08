import { useState, useEffect } from "react";
import Cards from "@components/Cards";
import Loading from '@components/Loading';

const ErrorMessage = ({ msg }) => {
	return (
		<p>{ msg }</p>
	);
};

export const Search = ({ state }) => {
	const [ posts, setPosts ] = useState(null);
	const [ artists, setArtists ] = useState(null);
	const {
		postsAPI: { posts: [ ,, getPosts ] },
		artistsAPI: { artists: [ ,, getArtists ] },
		search: [ { search, type } ],
		loading: [ loading, setLoading ]
	} = state;

	const fetchPosts = async options => {
		const res = await getPosts(options);

		setPosts(res);
		setLoading(false);
	};

	const fetchArtists = async options => {
		const res = await getArtists(options);

		setArtists(res);
		setLoading(false);
	};
	
	const API_GETTERS = {
		post: {
			data: posts,
			get: fetchPosts
		},
		artist: {
			data: artists,
			get: fetchArtists
		}
	};

	const API_HANDLER = API_GETTERS[type];

	useEffect(() => {
		setLoading(true);
		API_HANDLER.get({ search });
	}, [ search, type ]);

	if (!API_HANDLER.data || loading) return (
		<div className='flex items-center justify-center w-full'>
			<Loading size="100" color="var(--color-primary)" stroke="5" />
		</div>
	);

	if (API_HANDLER.data?.status !== 200) return <ErrorMessage msg={ API_HANDLER.data.content }/>

	return (
		<div className="flex flex-col gap-8">

			<h1 className="text-3xl font-bold">Resultados</h1>

			<Cards
				data={ API_HANDLER.data.content.docs }
				type={ type }
				author={ type === 'post' }
				title={ type !== 'post' }
				subtitle={ type !== 'post' }
				className='grid grid-cols-3 lg:grid-cols-5 !grid-flow-row mt-8 [&_li]:w-auto gap-3'
			/>

		</div>
	);
};