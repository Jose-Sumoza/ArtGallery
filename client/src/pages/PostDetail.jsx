import { useState, useContext, useEffect, useReducer } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DateTime } from 'luxon';
import { toast } from 'react-hot-toast';
import { Rating } from 'react-simple-star-rating';
import { GlobalState } from '@/GlobalState';
import Dialog from '@components/Dialog';
import Fieldset from '@components/Fieldset';
import Form from '@components/Form';
import Loading from '@components/Loading';
import MissingPhoto from '@/components/MissingPhoto';
import Photo from '@components/Photo';
import Tags from '@components/Tags';
import useScrollLock from '@hooks/useScrollLock';
import { Edit, StarEmpty, StarFilled, Trash } from '@icons';

const DeletePost = ({ post, id }) => {
	const { unlockScroll } = useScrollLock(true);
	const navigate = useNavigate();
	const state = useContext(GlobalState);
	const { postsAPI, modal: [ , setModal ], loadingModal: [ loading, setLoading ] } = state;
	const { delPosts } = postsAPI;
	const { author: { username } } = post;

	const handleDelete = async e => {
	    if (loading) return;

        setLoading(true);

		try {
			const { status, success, content } = await delPosts(id);

			if (status === 500) {
				setLoading(false);
				return toast.error("Error en el servidor.");
			};

			if (!success) {
				setLoading(false);
				setModal(null);
				return toast.error(content);
			};

			if (success) {
				unlockScroll();
				setModal(null);
				setLoading(false);
				toast.success(content);
				return navigate(`/artists/${ username }`);
			};
		} catch (err) {
			console.log(err);
			const { response: { data } } = err;
			const { success, content } = data;
			
			setLoading(false);
			if (!success) return toast.error(content);
		};
	};

	const handleCancel = () => {
		if (loading) return;
		unlockScroll();
		setModal(null);
	};

	return (
		<Dialog>

			<Dialog.Title>¿Borrar publicación?</Dialog.Title>

			<Dialog.Description>Esto no se puede deshacer</Dialog.Description>

			<Dialog.Buttons>

				<Dialog.Buttons.Cancel onClick={ handleCancel } isDisabled={ loading }>Cancelar</Dialog.Buttons.Cancel>

				<Dialog.Buttons.Accept
					classNames={{
						base: 'text-mercury-100'
					}}
					onClick={ handleDelete }
					icon={ <Trash className='w-4' /> }
					isLoading={ loading }
					danger
				>
					Borrar
				</Dialog.Buttons.Accept>

			</Dialog.Buttons>

		</Dialog>
	);
};

const reducer = (current, update) => ({...current, ...update});

export const PostDetail = () => {
	const navigate = useNavigate();
	const params = useParams();
	const [ post, setPost ] = useReducer(reducer, null);
	const [ loading, setLoading ] = useState(false);
	const [ personalRating, setPersonalRating ] = useReducer(reducer, {
		value: 0,
		comment: ''
	});
	const state = useContext(GlobalState);
	const { userAPI, postsAPI, modal: [ , setModal ], useTheme } = state;
	const { user: [ { user, isLogged } ] } = userAPI;
	const { getById, ratePost } = postsAPI;
	const { isDark } = useTheme;

	const fetchPost = async () => {
		const { status, success, content } = await getById(params.id);

		if (status === 500) {
			toast.error("Error en el servidor.");
			return navigate('/');
		};

		if (!success) {
			toast.error(content);
			return navigate('/');
		};

		setPost(content);
	};

	useEffect(() => {
		if (!post && params) fetchPost();
	}, []);

	if (!post) return (
		<div className='flex items-center justify-center w-full'>
			<Loading size="150" color={ isDark ? 'var(--purple)' : 'var(--color-primary)' } stroke="5" />
		</div>
	);

	const { author, title, description, images: [ img ], tags, rating, ratings, createdAt } = post;

	const AUTHOR_OPTIONS = [
		{
			label: 'edit',
			element: () => (
				<div
					data-tooltip-content="Editar"
					data-tooltip-place='bottom'
					data-tooltip-id='my-tooltip'
					className='p-1 text-bunker-700 dark:text-mercury-100 bg-white dark:bg-bunker-900/50 rounded-full shadow-md cursor-pointer hover:text-accent-500'
					onClick={ () => navigate( `/edit/${ params.id }` ) }
				>
					<Edit className='!w-4' />
				</div>
			)
		},
		{
			label: 'delete',
			element: () => (
				<div
					data-tooltip-content="Borrar"
					data-tooltip-place='bottom'
					data-tooltip-id='my-tooltip'
					className='p-1 text-bunker-700 dark:text-mercury-100 bg-white dark:bg-bunker-900/50 rounded-full shadow-md cursor-pointer hover:text-accent-500'
					onClick={ () => setModal({
						children: <DeletePost post={ post } id={ params.id } />
					})}
				>
					<Trash className='!w-4' />
				</div>
			)
		}
	];

	const onRate = value => {
		if (!isLogged) return toast.error('Inicia sesión para calificar');

		setPersonalRating({ value });
	};

	const handleRate = async e => {
		e.preventDefault();

		if (!isLogged) return toast.error('Inicia sesión para calificar');
	    if (loading) return;

		if (!personalRating.value) return toast.error('Debes elegir al menos media estrella para calificar');
		if (!personalRating.comment) return toast.error('La reseña es obligatoria');

        setLoading(true);

		try {
			const data = await ratePost(params.id, personalRating);

			const { status, success, content } = data;

			if (status === 500) {
				toast.error("Error en el servidor.");
				return setLoading(false);
			};
	
			if (!success) {
				toast.error(content);
				return setLoading(false);
			};
			
			await fetchPost();
			setLoading(false);
			return toast.success('Calificación subida exitosamente.');
		} catch (err) {
			const { response: { data } } = err;
			const { success, content } = data;
			
			setLoading(false);
			if (!success) toast.error(content);
		};
	};

	const fixedRating = Math.round(rating / .5) * .5;

	return (
		<main className='flex flex-col items-center justify-start w-full gap-16'>

			<section className='flex flex-col lg:flex-row items-center lg:items-start justify-start pb-16 w-full border-b-link-water-100 dark:border-b-bunker-900/50 border-b gap-16'>

				<div className='hidden dark:block absolute inset-0 left-0 lg:w-2/3 h-[70%] lg:h-[105%] blur-3xl overflow-hidden opacity-[.08] -z-10'>
					<figure className='w-full h-full'>
						<img
							src={ img.url }
							alt={ title }
							draggable={ false }
							onContextMenu={ e => e.preventDefault() }
							className='w-full h-full object-cover lg:[mask-image:linear-gradient(to_right,black_75%,transparent_85%)]'
						/>
					</figure>
				</div>

				<figure className='flex items-center justify-center flex-1 rounded-md aspect-square overflow-hidden'>
					<img
						src={ img.url }
						alt={ title }
						draggable={ false }
						onContextMenu={ e => e.preventDefault() }
						className='max-h-full rounded-md object-contain'
					/>
				</figure>

				<article className='flex flex-col flex-1 w-full gap-4'>

					<section className='flex flex-col relative p-6 border border-link-water-100 dark:border-bunker-900/50 rounded-md gap-6'>

						{
							author._id === user?._id && isLogged ?
								<ul className='flex items-center absolute bottom-4 lg:top-4 lg:bottom-auto right-4 gap-4'>
									{
										AUTHOR_OPTIONS.map(({ label, element: Option }) =>
											<li key={ label }>
												<Option />
											</li>
										)
									}
								</ul>
							:
								null
						}

						<div className='flex flex-col gap-2'>
							<h1 className='text-xl lg:text-4xl font-bold'>{ title }</h1>
							<div className='flex items-center justify-start gap-1'>
								<span>{ fixedRating.toFixed(1) }</span>
								<Rating
									initialValue={ fixedRating }
									iconsCount={ 5 }
									emptyIcon={ <StarEmpty className='min-w-[18px] w-[18px] inline-block' /> }
									fillIcon={ <StarFilled className='min-w-[18px] w-[18px] inline-block' /> }
									allowFraction
									readonly
									className='flex'
									emptyClassName='flex dark:!text-bunker-900'
									fillClassName='flex !text-accent-500'
									allowTitleTag={ false }
								/>
								<span className='text-xs font-mono text-bunker-400/70 dark:text-bunker-600'>({ ratings.length })</span>
							</div>
						</div>

						<time
							dateTime={ createdAt }
							data-tooltip-content={ DateTime.fromISO(createdAt).setLocale('es-VE').toLocaleString({ weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
							data-tooltip-place='right'
							data-tooltip-id='my-tooltip'
							className='w-fit pr-2 text-xs italic text-bunker-500'
						>
							Publicado { DateTime.fromISO(createdAt).setLocale('es-VE').toRelative() }
						</time>

					</section>

					<section className='flex flex-col p-6 border border-link-water-100 dark:border-bunker-900/50 rounded-md gap-6'>

						<h3 className='text-lg font-semibold'>Autor</h3>

						<div className='flex items-center justify-start flex-[1_1_0] gap-2'>

							<Link
								to={ `/artists/${ author.username }` }
								aria-label={ `${ author.names.split(' ')[0] } ${ author.lastnames.split(' ')[0] }` }
							>
								<figure>
									{
										author.photo?.url ?
											<Photo src={ author.photo.url } width={ 56 } height={ 56 } />
										:
											<MissingPhoto className='w-14 rounded-full' />
									}
								</figure>
							</Link>

							<div className='flex flex-col justify-start h-full'>
								
								<Link
									to={ `/artists/${ author.username }` }
									aria-label={ `${ author.names.split(' ')[0] } ${ author.lastnames.split(' ')[0] }` }
									className='font-medium hover:text-accent-500 transition-colors duration-100'
								>
									<h2>{ author.names.split(' ')[0] } { author.lastnames.split(' ')[0] }</h2>
								</Link>

								{ author.headline ? <span className='font-light text-bunker-600'>{ author.headline }</span> : null }

							</div>

						</div>

					</section>

					<section className='flex flex-col p-6 border border-link-water-100 dark:border-bunker-900/50 rounded-md gap-6'>
						
						<h3 className='text-lg font-semibold'>Etiquetas</h3>

						<Tags className='flex flex-wrap w-full gap-2' tags={ tags } />

					</section>

				</article>

			</section>

			<section className='flex flex-col pb-16 w-full border-b-link-water-100 dark:border-b-bunker-900/50 border-b gap-8'>

				<h3 className='text-xl font-semibold'>Descripción</h3>

				<p className='w-full whitespace-pre-wrap'>{ description }</p>

			</section>

			<section className='flex flex-col w-full gap-8'>

				<h3 className='text-xl font-semibold'>Calificaciones y Reseñas</h3>

				{
					author._id !== user?._id && ratings.every(({ author }) => author._id !== user?._id) ?
						<Form
							onSubmit={ handleRate }
							className='group flex flex-col lg:w-2/5 gap-3'
						>
							<Fieldset
								classNames={{
									content: '!mt-0'
								}}
							>
									
								<Fieldset.Field className='gap-2'>

									<Fieldset.Field.Label
										htmlFor='comment'
										className='font-medium'
									>
										¿Qué te ha parecido esta obra de arte?
									</Fieldset.Field.Label>
			
									<Fieldset.Field.Container className='flex-col !items-start gap-3'>

										<div
											className='flex items-center justify-start'
											onClick={ () => !isLogged ? toast.error('Inicia sesión para calificar') : null }
										>
											<Rating
												initialValue={ 0 }
												iconsCount={ 5 }
												emptyIcon={ <StarEmpty className='min-w-[20px] w-[20px] inline-block' /> }
												fillIcon={ <StarFilled className='min-w-[20px] w-[20px] inline-block' /> }
												allowFraction
												className={ `flex ${ loading || !isLogged ? 'cursor-not-allowed opacity-50' : '' }` }
												emptyClassName='flex dark:!text-bunker-900'
												fillClassName='flex !text-accent-500'
												allowTitleTag={ false }
												onClick={ onRate }
												readonly={ loading || !isLogged }
												disableFillHover
											/>
										</div>
			
										<Fieldset.Field.Container.TextArea
											name='comment'
											id='comment'
											placeholder='Escribe tu reseña aquí'
											value={ personalRating.comment }
											onChange={ e => setPersonalRating({ comment: e.target.value }) }
											required
											maxLength={ 600 }
											rows={ 3 }
											disabled={ loading }
											className='!px-4 !py-2 resize-none !rounded dark:text-mercury-100 bg-link-water-100 dark:bg-bunker-900/30 border border-link-water-200 dark:border-bunker-800 transition-colors duration-100 select-none focus:border-accent-500 disabled:opacity-80 disabled:cursor-not-allowed placeholder:dark:text-bunker-800'
										/>
			
									</Fieldset.Field.Container>

								</Fieldset.Field>

							</Fieldset>

							<Form.Footer className='flex flex-col items-end w-full'>

								<Form.Footer.Buttons>

									<button
										type='submit'
										className={ `flex items-center justify-center relative px-4 py-2 w-fit rounded bg-accent-500 transition-[filter_color] duration-100 [&_l-ring]:absolute ${ loading ? 'cursor-not-allowed opacity-80' : 'hover:brightness-110 hover:contrast-75' }` }
									>

										{ loading ? <Loading size="16" stroke="1.5" color="var(--bg-color)" /> : null }
										<span className={ `text-mercury-100 ${ loading ? 'opacity-0' : '' }` }>Calificar</span>

									</button>

								</Form.Footer.Buttons>

							</Form.Footer>

						</Form>
					:
						null
				}

				{
					ratings?.length ?
						<ul className='flex flex-col w-full gap-8'>
							{
								ratings.map(rate => {
									const { author, comment, timestamp, value } = rate;

									return (
										<li
											key={ author._id }
											className='flex flex-col gap-3'
										>

											<div className='flex items-center justify-start flex-[1_1_0] gap-2'>
					
												<Link
													to={ `/artists/${ author.username }` }
													data-tooltip-content={ author.username }
													data-tooltip-place='bottom'
													data-tooltip-id='my-tooltip'
													aria-label={ `${ author.names.split(' ')[0] } ${ author.lastnames.split(' ')[0] }` }
												>
													<figure>
														{
															author.photo?.url ?
																<Photo
																	src={ author.photo.url }
																	alt={ `Foto de perfil de ${ author.username }` }
																	width={ 40 }
																	height={ 40 }
																/>
															:
																<MissingPhoto className='w-10 rounded-full' />
														}
													</figure>
												</Link>
					
												<div className='flex flex-col justify-start h-full'>
													<Link
														to={ `/artists/${ author.username }` }
														data-tooltip-content={ author.username }
														data-tooltip-place='bottom'
														data-tooltip-id='my-tooltip'
														aria-label={ `${ author.names.split(' ')[0] } ${ author.lastnames.split(' ')[0] }` }
														className='font-medium hover:text-accent-500 transition-colors duration-100'
													>
														<h2>{ author.names.split(' ')[0] } { author.lastnames.split(' ')[0] }</h2>
													</Link>

													<time
														dateTime={ timestamp }
														data-tooltip-content={ DateTime.fromISO(timestamp).setLocale('es-VE').toLocaleString({ weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
														data-tooltip-place='right'
														data-tooltip-id='my-tooltip'
														className='text-xs dark:text-bunker-500 opacity-80'
													>
														{ DateTime.fromISO(timestamp).setLocale('es-VE').toRelative()[0].toUpperCase() }{ DateTime.fromISO(timestamp).setLocale('es-VE').toRelative().slice(1) }
													</time>
												</div>
					
											</div>

											<div className='flex mt-1'>
												<Rating
													initialValue={ value }
													iconsCount={ 5 }
													emptyIcon={ <StarEmpty className='min-w-[18px] w-[18px] inline-block' /> }
													fillIcon={ <StarFilled className='min-w-[18px] w-[18px] inline-block' /> }
													allowFraction
													readonly
													className='flex'
													emptyClassName='flex dark:!text-bunker-900'
													fillClassName='flex !text-accent-500'
													allowTitleTag={ false }
												/>
											</div>

											<p className='whitespace-pre-wrap'>{ comment }</p>

										</li>
									);
								})
							}
						</ul>
					:
						<p className='w-full text-sm font-medium text-bunker-500'>Aun no hay calificaciones disponibles. { author._id !== user?._id ? <span className='font-normal'>¡Se el primero en calificar!</span> : null }</p>
				}
			</section>

		</main>
	);
};