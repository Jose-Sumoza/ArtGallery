import { Link } from 'react-router-dom';
import MissingPhoto from "@components/MissingPhoto";
import Photo from '@components/Photo';

const Card = ({ data, type }) => {
	const { image, title, subtitle } = data;

	return (
		<div className="flex flex-col rounded-xl overflow-hidden">

			<figure className='aspect-square overflow-hidden [&_img]:w-full [&_img]:h-full [&_img]:object-cover'>
				{ image }
			</figure>

			{
				title || subtitle ?
					<div className="flex flex-col p-4 h-20 bg-white dark:bg-bunker-900/40 gap-1">
						{ title ? <h4 className='font-medium line-clamp-1'>{ title }</h4> : null }
						{ subtitle ? <h5 className='text-sm text-secondary dark:text-bunker-500 capitalize line-clamp-1'>{ subtitle }</h5> : null }
					</div>
				:
					null
			}

		</div>
	);
};

const PostCard = ({ doc, title, subtitle, author }) => {
	const data = {
		image: <img src={ doc.images[0].url } alt={ doc.title } draggable={ false } onContextMenu={ e => e.preventDefault() } />,
		title: title ? doc.title : null,
		subtitle: subtitle ? `${ doc.author.names.split(' ')[0] } ${ doc.author.lastnames.split(' ')[0] }` : null
	};

	return (
		<li key={ doc._id } className='w-72 lg:w-auto snap-start'>
			<Link
				to={ `/posts/${ doc._id }` }
				data-tooltip-content={ `${ doc.title }${ author ? ` por ${ doc.author.names.split(' ')[0] } ${ doc.author.lastnames.split(' ')[0] }` : '' }` }
				data-tooltip-place='bottom'
				data-tooltip-id='my-tooltip'
				aria-label={ `${ doc.title }${ author ? ` por ${ doc.author.username }` : '' }` }
			>
				<Card data={ data } type='post'  />
			</Link>
		</li>
	);
};

const ArtistCard = ({ doc, title, subtitle }) => {
	const data = {
		image: doc.photo?.url ?
			<Photo
				src={ doc.photo.url }
				alt={ doc.username }
				width={ null }
				height={ null }
				className='!rounded-none'
			/>
		:
			<MissingPhoto />,
		title: title ? `${ doc.names.split(' ')[0] } ${ doc.lastnames.split(' ')[0] }` : null,
		subtitle: subtitle ? doc.username : null
	};

	return (
		<li key={ doc._id } className='w-72 lg:w-auto snap-start'>
			<Link
				to={ `/artists/${ doc.username }` }
				data-tooltip-content={ doc.headline }
				data-tooltip-place='bottom'
				data-tooltip-id='my-tooltip'
				aria-label={ doc.username }
			>
				<Card data={ data } type='artist' />
			</Link>
		</li>
	)
};

const CARD_TYPE = {
	Post: PostCard,
	Artist: ArtistCard
};

const Cards = ({ className = '', data, type, title, subtitle, author, ...props }) => {
	return (
		<ul
			className={ `grid-flow-col w-full overflow-y-auto overscroll-x-contain overscroll-y-auto snap-x snap-mandatory [scrollbar-width:none] ${ className }` }
			{ ...props }
		>
			{
				data.map(doc => {
					const CardWrapper = type === 'post' ?
						<CARD_TYPE.Post key={ doc._id } doc={ doc } title={ title } subtitle={ subtitle } author={ author } />
					:
						<CARD_TYPE.Artist key={ doc._id } doc={ doc } title={ title } subtitle={ subtitle } />;

					return CardWrapper;
				})
			}
		</ul>
	);
};

export default Cards;