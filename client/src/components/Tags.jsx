import { forwardRef } from "react";

const Tags = forwardRef(({ tags, ...props }, ref) => {
	return (
		<ul { ...props } ref={ ref }>
			{
				tags.map((tag, ind) =>
					<li
						key={ ind }
						className='flex items-center justify-center px-2 py-1 rounded text-sm text-primary border border-link-water-300 bg-link-water-50 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity] duration-100 gap-2 select-none hover:bg-link-water-300 hover:border-link-water-400'
					>
						{ tag }
					</li>
				)
			}
		</ul>
	);
});

export default Tags;