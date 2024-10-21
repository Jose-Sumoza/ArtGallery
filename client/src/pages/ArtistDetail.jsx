import { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { GlobalState } from '@/GlobalState';
import Cards from "@components/Cards";
import Loading from '@components/Loading';
import MissingPhoto from '@/components/MissingPhoto';
import Photo from '@components/Photo';
import Tags from '@components/Tags';

export const ArtistDetail = () => {
	const navigate = useNavigate();
	const params = useParams();
	const [ artist, setArtist ] = useState(null);
	const state = useContext(GlobalState);
	const { artistsAPI } = state;
	const { getById } = artistsAPI;

	const fetchArtist = async () => {
		const { status, success, content } = await getById({ id: params.id });

		if (status === 500) {
			toast.error("Error en el servidor.");
			return navigate('/');
		};

		if (!success) {
			toast.error(content);
			return navigate('/');
		};

		setArtist(content);
	};

	useEffect(() => {
		if (!artist && params) fetchArtist();
	}, []);

	if (!artist) return (
		<div className='flex items-center justify-center w-full'>
			<Loading size="150" color="var(--color-primary)" stroke="5" />
		</div>
	);

	const { names, lastnames, photo, summary, headline, posts } = artist;

	return (
		<main className='flex flex-col w-full gap-16'>

			<section className='flex flex-col items-center w-full gap-6'>

				<figure>
					{
						photo?.url ?
							<Photo src={ photo.url } className='w-60 lg:w-28' />
						:
							<MissingPhoto className='w-60 lg:w-28 rounded-full' />
					}
				</figure>

				<div className='flex flex-col items-center gap-2'>

					<h1 className='flex flex-col lg:block text-2xl font-bold text-center'>
						<span>{ names } {" "}</span>
						<span>{ lastnames }</span>
					</h1>
					{ headline ? <span className='font-light text-lg lg:text-base text-secondary'>{ headline }</span> : null }
					{ summary ? <p className='text-lg lg:text-base font-medium'>{ summary }</p> : null }

				</div>

			</section>

			{
				posts.length ?
					<section className='flex flex-col pt-16 w-full border-t-link-water-100 border-t gap-8'>

						<h3 className='text-lg font-semibold'>Obras</h3>

						<Tags className='flex flex-wrap w-full gap-2' tags={ [ ...new Set(posts.flatMap(({ tags }) => tags)) ] } />

						<Cards
							data={ posts }
							type='post'
							className='grid grid-cols-3 lg:grid-cols-5 !grid-flow-row mt-8 [&_li]:w-auto gap-3'
						/>

					</section>
				:
					null
			}

		</main>
	);
};