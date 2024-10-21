import { User } from '@icons';

const MissingPhoto = ({ className }) => {
	return (
		<div className={ `flex items-center justify-center aspect-square text-link-water-300 bg-link-water-100 ${ className || '' }` }>
			<User className='!w-3/5' />
		</div>
	);
};

export default MissingPhoto;