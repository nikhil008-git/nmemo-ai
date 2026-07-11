export default function Microinteraction() {
    const microinteractions = [
        {
            title: "One agent. Three jobs.",
            description: "Every visitor question gets retrieved, grounded, and routed.",
        },
        {
            title: "One agent. Three jobs.",
            description: "Every visitor question gets retrieved, grounded, and routed.",
        },
    ]
  return (
    <div>
       <section
        id="product"
        className="relative mx-auto w-full max-w-5xl scroll-mt-24 px-6 py-24 sm:py-32"
      >
       
        <h2 className="mt-0 max-w-md text-[1.75rem] font-semibold tracking-[-0.03em] leading-[1.15] sm:text-3xl md:text-[2.15rem]">
          One <span>agent</span>. Three jobs.
        </h2>
        <h2 className="mt-4 max-w-md text-[1.75rem] font-semibold tracking-[-0.03em] leading-[1.15] sm:text-3xl md:text-[2.15rem]">
          <span className="text-neutral-500">Every</span > <span className="text-blue-500 bg-blue-500/10 rounded-md px-1 py-0.5 ">visitor</span> <span className="text-neutral-500">question gets </span> retrieved, grounded, and routed.
        </h2>
     
      </section>
    </div>
  );
}