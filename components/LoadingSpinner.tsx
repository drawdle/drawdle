export const LoadingSpinner = ({ n }: { n: number }) => {
	return (
		<div className="relative w-9 h-9">
			{Array.from(Array(n), (_, i) => i).map((i) => (
				<div
					key={`spinner-${i}`}
					className="top-3 left-4 absolute bg-beige-400 opacity-0 rounded-full w-1 h-3"
					style={{
						transform: `rotate(${(360 / n) * i}deg) translateY(100%)`,
						animation: "loadingSpinner 1s infinite linear",
						animationDelay: `${(1 / n) * i}s`,
					}}
				/>
			))}
		</div>
	);
};
