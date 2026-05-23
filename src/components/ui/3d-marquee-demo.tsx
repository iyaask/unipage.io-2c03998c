"use client";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import success1 from "@/assets/gallery/success-1.webp";
import success2 from "@/assets/gallery/success-2.webp";
import success3 from "@/assets/gallery/success-3.webp";
import success4 from "@/assets/gallery/success-4.webp";
import success5 from "@/assets/gallery/success-5.webp";
import success6 from "@/assets/gallery/success-6.webp";
import success7 from "@/assets/gallery/success-7.webp";

export default function ThreeDMarqueeDemo() {
  const images = [
    success1,
    success5, 
    success3,
    success2,
    success6,
    success7,
    success4,
    success1,
    success5,
    success3,
    success2,
    success6,
    success7,
    success4,
    success1,
    success5,
    success3,
    success2,
    success6,
    success7,
    success4,
    success1,
    success5,
    success3,
    success2,
    success6,
    success7,
    success4,
  ];
  return (
    <div className="mx-auto my-10 max-w-7xl rounded-3xl bg-gray-950/5 p-1 ring-1 ring-neutral-700/10 dark:bg-neutral-800">
      <ThreeDMarquee images={images} />
    </div>
  );
}