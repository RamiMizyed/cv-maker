"use client";
import React, { useState, DragEvent, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

// A simple SVG loader component for the uploading state
const Loader = () => (
	<motion.svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		animate={{ rotate: 360 }}
		transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
		className="text-white">
		<path
			d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
			opacity=".25"
			fill="currentColor"
		/>
		<path
			d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
			fill="currentColor"
		/>
	</motion.svg>
);

//
// Folder Icon (Refactored with Variants)
//
const FolderIcon = ({
	isOpen,
	fileName,
}: {
	isOpen: boolean;
	fileName?: string;
}) => {
	const lidVariants = {
		closed: { y: 0, rotateZ: 0 },
		open: { y: 50, rotateZ: -5 },
	};

	const bodyVariants = {
		closed: { y: 0, scale: 1 },
		open: { y: -25, scale: 1.02 },
	};

	return (
		<div className="relative">
			<svg
				className="w-32 md:w-44  overflow-visible" //
				viewBox="0 0 593 494"
				fill="none"
				xmlns="http://www.w3.org/2000/svg">
				<g filter="url(#filter0_d_2_28)">
					{/* Folder Back */}
					<motion.path
						className="fill-yellow-800/90 dark:fill-rose-400 z-50"
						style={{ transformOrigin: "100px 40px" }}
						variants={lidVariants}
						animate={isOpen ? "open" : "closed"}
						transition={{
							type: "spring",
							stiffness: 200,
							damping: 18,
							delay: 0.025,
						}}
						stroke="url(#folderGlowStroke)"
						d="M85 399H488c5.523 0 10-4.477 10-10V108.275c0-5.523-4.477-10-10-10H281.865c-3.621 0-6.96-1.958-8.728-5.119l-7.29-13.036c-1.768-3.161-5.107-5.12-8.728-5.12H85c-5.523 0-10 4.477-10 10v304c0 5.523 4.477 10 10 10Z"
					/>
					{/* Floating File Window */}
					<motion.g
						variants={bodyVariants}
						animate={isOpen ? "open" : "closed"}
						transition={{ type: "spring", stiffness: 200, damping: 20 }}>
						<rect
							x={97}
							y={115}
							width={378}
							height={273}
							rx={12}
							fill="rgba(255,255,255,0.95)"
							stroke="rgba(200,200,200,0.4)"
							strokeWidth={1}
							style={{ filter: "drop-shadow(0 5px 15px rgba(0,0,0,0.15))" }}
						/>
						<rect
							x={97}
							y={115}
							width={378}
							height={28}
							rx={12}
							fill="rgba(230,230,230,0.9)"
						/>
						<circle cx={110} cy={129} r={6} fill="#ff5f57" />
						<circle cx={130} cy={129} r={6} fill="#febc2e" />
						{fileName && (
							<g transform={`translate(${97 + 20}, ${115 + 65})`}>
								<path d="M0 0 H24 V28 H0 Z" fill="#4f4f4f" rx="3" />
								<path d="M24 0 L18 0 L24 6 Z" fill="#6b6b6b" />
								<rect x="4" y="6" width="16" height="2" fill="white" rx="0.5" />
								<rect
									x="4"
									y="10"
									width="16"
									height="2"
									fill="white"
									rx="0.5"
								/>
								<rect
									x="4"
									y="14"
									width="12"
									height="2"
									fill="white"
									rx="0.5"
								/>
								<text
									x={32}
									y={12}
									fill="black"
									fontSize="18"
									fontWeight={500}
									fontFamily="'Inter', sans-serif"
									dominantBaseline="middle">
									{fileName.match(/.{1,20}/g)?.map((chunk, i) => (
										<tspan key={i} x={32} dy={i === 0 ? 0 : 20}>
											{chunk}
										</tspan>
									))}
								</text>
							</g>
						)}
					</motion.g>

					{/* Folder Front */}
					<motion.path
						style={{ transformOrigin: "100px 40px" }}
						variants={lidVariants}
						animate={isOpen ? "open" : "closed"}
						transition={{ type: "spring", stiffness: 200, damping: 18 }}
						className={"fill-yellow-600 dark:fill-rose-500 z-50 "}
						d="M488 399H85c-5.523 0-10-4.477-10-10V171.445c0-5.523 4.477-10 10-10h206.25c3.959 0 7.546-2.336 9.146-5.957l7.749-17.529c1.6-3.621 5.187-5.959 9.147-5.959H488c5.523 0 10 4.477 10 10v247c0 5.523-4.477 10-10 10Z"
						stroke="url(#folderGlowStroke)"
						strokeWidth="3"
					/>
				</g>
				<defs>
					{/* ... (defs remain the same) ... */}
					<filter
						id="filter0_d_2_28"
						x="0"
						y="0"
						width="593"
						height="494"
						filterUnits="userSpaceOnUse"
						colorInterpolationFilters="sRGB">
						<feFlood floodOpacity="0" result="BackgroundImageFix" />
						<feColorMatrix
							in="SourceAlpha"
							type="matrix"
							values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
							result="hardAlpha"
						/>
						<feOffset dx="10" dy="10" />
						<feGaussianBlur stdDeviation="42.5" />
						<feColorMatrix
							type="matrix"
							values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"
						/>
						<feBlend
							mode="normal"
							in2="BackgroundImageFix"
							result="effect1_dropShadow_2_28"
						/>
						<feBlend
							mode="normal"
							in="SourceGraphic"
							in2="effect1_dropShadow_2_28"
							result="shape"
						/>
					</filter>
					<linearGradient id="folderGlowStroke" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
						<stop offset="50%" stopColor="#bc123e" stopOpacity="0.2" />
						<stop offset="100%" stopColor="#000" stopOpacity="0" />
					</linearGradient>
				</defs>
			</svg>
		</div>
	);
};

// ... FileIcon remains the same ...
const FileIcon = ({ name }: { name: string }) => (
	<div className="flex w-full items-start text-white font-medium text-sm">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="22"
			height="22"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="mr-2 h-5 w-5 flex-shrink-0">
			<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
			<polyline points="14 2 14 8 20 8"></polyline>
		</svg>
		<span className="whitespace-normal break-words break-all flex-1">
			{name}
		</span>
	</div>
);

//
// Main Card (Refactored)
//
const FileUploadCard = ({
	onFileSelect,
	accept = "*", // defaults to any file
}: {
	onFileSelect?: (file: File) => void | Promise<void>;
	accept?: string; // e.g. "image/*", "application/pdf", ".docx"
}) => {
	const [file, setFile] = useState<File | null>(null);
	const [uploadState, setUploadState] = useState<"idle" | "uploading" | "sent">(
		"idle"
	);

	const [isHovering, setIsHovering] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

	const dragCounter = useRef(0);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const isFolderOpen = isHovering || isDragging || !!file;

	const setFileAndResetInput = (newFile: File | null) => {
		setFile(newFile);

		if (!newFile && fileInputRef.current) {
			fileInputRef.current.value = "";
		}

		if (newFile && onFileSelect) {
			// If accept is defined, double-check validity
			if (
				accept &&
				accept !== "*" &&
				!newFile.type.match(accept.replace("*", ".*"))
			) {
				console.warn("File type not allowed:", newFile.type);
				return;
			}
			void onFileSelect(newFile);
		}
	};

	const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		dragCounter.current++;
		if (dragCounter.current === 1) setIsDragging(true);
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		dragCounter.current--;
		if (dragCounter.current === 0) setIsDragging(false);
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		dragCounter.current = 0;

		if (e.dataTransfer.files?.length > 0) {
			setFileAndResetInput(e.dataTransfer.files[0]);
			e.dataTransfer.clearData();
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			setFileAndResetInput(files[0]);
		}
	};

	const handleUpload = () => {
		if (file) {
			setUploadState("uploading");
			setTimeout(() => {
				setUploadState("sent");
				setTimeout(() => {
					setFileAndResetInput(null);
					setUploadState("idle");
				}, 1800);
			}, 2000);
		}
	};

	// --- Dynamic label based on accept ---
	const isImageOnly = accept.startsWith("image");
	const label = isImageOnly ? "Upload an Image" : "Upload a File";
	const subLabel = isImageOnly
		? "Drop your image here."
		: "Drop your document here.";

	return (
		<div className="flex items-center justify-center p-3 lg:p-6">
			<motion.div
				onMouseEnter={() => setIsHovering(true)}
				onMouseLeave={() => setIsHovering(false)}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={(e) => e.preventDefault()}
				onDrop={handleDrop}
				onClick={() => fileInputRef.current?.click()}
				className="relative w-full flex flex-col xl:flex-row items-center justify-center  text-center overflow-hidden cursor-pointer"
				animate={{
					borderColor: isDragging ? "rgb(34 197 94)" : "rgb(31 41 55)",
				}}>
				<input
					ref={fileInputRef}
					type="file"
					accept={accept} // ✅ restricts file picker
					className="hidden"
					onChange={handleFileChange}
					disabled={uploadState === "uploading"}
				/>

				<motion.div
					animate={{ scale: isFolderOpen ? 0.95 : 1 }}
					transition={{ duration: 0.3 }}
					className="relative z-10">
					<FolderIcon isOpen={isFolderOpen} fileName={file?.name} />
				</motion.div>

				<div className="relative z-10 w-full flex flex-col items-center justify-center h-28">
					<AnimatePresence>
						{!file && uploadState === "idle" && (
							<motion.div
								layout
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.3 }}
								className="absolute text-center">
								<h2 className="text-xl font-semibold">{label}</h2>
								<p className="mt-2 text-sm">{subLabel}</p>
							</motion.div>
						)}
					</AnimatePresence>

					<AnimatePresence>
						{file && (
							<motion.div
								layout
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
								transition={{ type: "spring", stiffness: 300, damping: 22 }}
								className="absolute flex flex-col items-center justify-center gap-4 w-full px-4">
								<div className="flex items-center w-full justify-between gap-2 bg-zinc-900/90 px-3 py-2 rounded-lg shadow-lg">
									<FileIcon name={file.name} />
									<motion.button
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.9 }}
										className="text-white cursor-pointer font-bold p-1 rounded-full flex-shrink-0"
										onClick={(e) => {
											e.stopPropagation();
											setFileAndResetInput(null);
										}}
										disabled={uploadState === "uploading"}>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2.5"
											strokeLinecap="round"
											strokeLinejoin="round">
											<line x1="18" y1="6" x2="6" y2="18"></line>
											<line x1="6" y1="6" x2="18" y2="18"></line>
										</svg>
									</motion.button>
								</div>
								<Button
									className="w-full"
									variant={"secondary"}
									onClick={(e) => {
										e.stopPropagation();
										handleUpload();
									}}
									disabled={uploadState === "uploading"}>
									{uploadState === "uploading" ? (
										<Loader />
									) : uploadState === "sent" ? (
										<span className="flex items-center justify-center gap-2 text-green-500 font-semibold">
											<svg
												width="18"
												height="18"
												fill="none"
												viewBox="0 0 24 24">
												<circle cx="12" cy="12" r="10" fill="#22c55e" />
												<path
													d="M8 12.5l3 3 5-5"
													stroke="#fff"
													strokeWidth="2.2"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
											Sent!
										</span>
									) : (
										"Upload File"
									)}
								</Button>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</motion.div>
		</div>
	);
};

export default FileUploadCard;
