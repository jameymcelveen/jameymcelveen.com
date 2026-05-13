import Image from 'next/image';

const CAPTION = 'Principal Architect · Florence, SC';

type Props = {
  alt: string;
};

/**
 * Polaroid-style hero photo (max 280px). Caption uses Caveat via `--font-caveat` on body.
 */
export function HomePolaroidPhoto({ alt }: Props) {
  return (
    <div
      className="mx-auto w-full max-w-[280px]"
      style={{ transform: 'rotate(-1.5deg)' }}
    >
      <div className="rounded-sm bg-white pb-3 shadow-[0_12px_28px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="p-2.5 pb-0">
          <div className="overflow-hidden rounded-[2px] bg-white p-1.5 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]">
            <Image
              src="/jamey-mcelveen.jpg"
              alt={alt}
              width={248}
              height={248}
              className="aspect-square h-auto w-full object-cover"
              sizes="280px"
              priority
            />
          </div>
        </div>
        <p
          className="text-[#3a3a45] px-3 pt-2 pb-1 text-center text-[1.35rem] leading-snug sm:text-[1.45rem]"
          style={{ fontFamily: 'var(--font-caveat), cursive' }}
        >
          {CAPTION}
        </p>
      </div>
    </div>
  );
}
