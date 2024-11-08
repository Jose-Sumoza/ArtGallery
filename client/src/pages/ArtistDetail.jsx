import { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { GlobalState } from '@/GlobalState';
import Cards from "@components/Cards";
import Loading from '@components/Loading';
import MissingPhoto from '@/components/MissingPhoto';
import Photo from '@components/Photo';
import Tags from '@components/Tags';
import { WhatsApp, Instagram, TikTok, Facebook, Twitter, Mail } from '@icons';

const ICONS = {
	phone: WhatsApp,
	instagram: Instagram,
	tiktok: TikTok,
	facebook: Facebook,
	twitter: Twitter,
	email: Mail
};

export const ArtistDetail = () => {
	const navigate = useNavigate();
	const params = useParams();
	const [ artist, setArtist ] = useState(null);
	const state = useContext(GlobalState);
	const { artistsAPI, useTheme } = state;
	const { getById } = artistsAPI;
	const { isDark } = useTheme;

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
			<Loading size="150" color={ isDark ? 'var(--purple)' : 'var(--color-primary)' } stroke="5" />
		</div>
	);

	const { names, lastnames, photo, summary, headline, contact, posts } = artist;

	const availableContacts = Object.entries(contact).map(([ key, value ]) => {
		if (key === 'phone') return ({
			label: key,
			url: value.dialCode && value.number ? `https://wa.me/${ value.dialCode }${ value.number }` : '',
			tooltip: "Enviar mensaje a WhatsApp"
		});

		if (key === 'email') return ({
			label: key,
			url: value ? `mailto:${ value }` : value,
			tooltip: "Correo electrónico"
		});

		return ({ label: key, url: value, tooltip: `${ key[0].toUpperCase() }${ key.slice(1) }` });
	}).filter(({ url }) => url);

	return (
		<main className='flex flex-col w-full gap-10'>

			<section className='flex flex-col items-center w-full gap-6'>
			
				{
					photo?.url ?
						<div className='hidden dark:block absolute top-0 left-0 w-full h-[50%] lg:h-[50%] [mask-image:linear-gradient(to_bottom,black_0%,transparent_100%)] overflow-hidden opacity-50 lg:opacity-30 -z-10'>
							<figure className='w-full h-full'>
								<img
									src={ photo.url }
									draggable={ false }
									onContextMenu={ e => e.preventDefault() }
									className='w-full h-full object-cover blur-3xl'
								/>
							</figure>
						</div>
					:
						null
				}


				<figure>
					{
						photo?.url ?
							<Photo src={ photo.url } className='w-52 lg:w-44' />
						:
							<MissingPhoto className='w-52 lg:w-44 rounded-full' />
					}
				</figure>

				<div className='flex flex-col items-center gap-2'>

					<h1 className='flex flex-col lg:block text-2xl font-bold text-center'>
						<span>{ names } {" "}</span>
						<span>{ lastnames }</span>
					</h1>

					{ headline ? <span className='font-light text-lg lg:text-base text-bunker-500'>{ headline }</span> : null }

					{ summary ? <p className='text-lg lg:text-base font-medium'>{ summary }</p> : null }
					
					{
						availableContacts.length ?
							<ul className='flex items-center mt-6 gap-4'>
								{
									availableContacts.map(({ label, url, tooltip }) => {
										const Icon = ICONS[label];

										return (
											<li
												key={ label }
												data-tooltip-content={ tooltip }
												data-tooltip-place='bottom'
												data-tooltip-id='my-tooltip'
											>
												<a
													href={ url }
													target='_blank'
													rel='noopener noreferrer'
													className='group'
												>
													<Icon className='min-h-7 lg:min-h-6 stroke-2 text-bunker-500 group-hover:text-bunker-700 dark:text-bunker-700 dark:group-hover:text-bunker-500' />
												</a>
											</li>
										);
									})
								}
							</ul>
						:
							null
					}
					
				</div>

			</section>

			{
				posts.length ?
					<section className='flex flex-col pt-10 w-full border-link-water-100 dark:border-bunker-900/50 border-t gap-8'>

						<Tags className='flex flex-wrap w-full gap-2' tags={ [ ...new Set(posts.flatMap(({ tags }) => tags)) ].sort((a, b) => a.localeCompare(b, 'es')) } />

						<h3 className='text-lg font-semibold'>Obras</h3>

						<Cards
							data={ posts }
							type='post'
							className='grid grid-cols-3 lg:grid-cols-5 !grid-flow-row [&_li]:w-auto gap-3'
						/>

					</section>
				:
					null
			}

		</main>
	);
};