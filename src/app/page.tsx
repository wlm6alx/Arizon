import Image from "next/image";
import Link from "next/link";
import TextType from "@/components/TextType";

export default function Home() {
  const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};

  return (
    <>
      <section className="relative h-screen w-full">
        <Image
          src={"/Back.jpg"}
          alt="Background image"
          fill
          className="object-cover"
        />

        <div className="relative z-10 items-center flex flex-col h-full justify-between  ">
          <header className="flex justify-between items-center px-8 py-4 text-sm space-x-10 ">
            
            {/* Réseaux sociaux */}
            <div className="flex items-center gap-4">
              <Link href={"/"} className="group bg-white rounded-full p-2 transition duration-300 ease-out hover:bg-green-400">
                <Image src={"/icons_x.svg"} alt="X" width={30} height={30} 
                className="transition-transform duration-300 ease-out group-hover:scale-130"/>
              </Link>

              <Link href={"/"} className="group bg-white rounded-full p-2 transition duration-300 ease-out hover:bg-green-400">
                <Image src={"/icons_facebook.svg"} alt="Facebook" width={30} height={30}
                 className="transition-transform duration-300 ease-out group-hover:scale-130"/>
              </Link>

              <Link href={"/"} className="group bg-white rounded-full p-2 transition duration-300 ease-out hover:bg-green-400">
                <Image src={"/icons_pinterest.svg"} alt="Pinterest" width={30} height={30}
                className="transition-transform duration-300 ease-out group-hover:scale-130" />
              </Link>

              <Link href={"/"} className="group bg-white rounded-full p-2 transition duration-300 ease-out hover:bg-green-400">
                <Image src={"/icons_instagram.svg"} alt="Instagram" width={30} height={30} 
                className="transition-transform duration-300 ease-out group-hover:scale-130"/>
              </Link>
            </div>

            {/* Contacts */}
            <div className="flex items-center gap-6">
              <div className="text-black">
                <p>call anytime</p>
                <p>+98 (000)-9630</p>
              </div>

              {/* Séparateur */}
              <span className="rotate-90 w-10 h-0.5 bg-black"></span>

              <div className="text-black">
                <p>send mail</p>
                <p>ambed@agrios.com</p>
              </div>
            </div>
          </header>
          {/*Souhait de bienvenue*/}
              <div className="relative bottom-20 right-80 text-center text-blue-900 mb-48">
             <TextType 
  text={["BIENVENUE SUR", "WELCOME TO"]}
  typingSpeed={75}
  pauseDuration={1500}
  className="text-5xl font-bold"
  showCursor={false}
  cursorCharacter="|"
/>   
                <Image
src={"/ArizonHero.svg"}
alt ="logo Arizon"
width={400}
height={200}
/> 
              </div>
        </div>
      </section>
      <div className="bg-[#1F4E3D] flex w-full"> 
<div className="size-1/3 text-white grow-3 text-center p-5 justify-center">
  <p>
    Call anytime 
  </p>
  <p>
    +4733378901
  </p>
</div>
<span className="w-0.5 h-16 bg-white self-center mx-2"></span>

  <div className="size-1/3 text-white grow-3 items-center p-5 justify-center">
  <Image 
  src={"/AriZonLink.svg"}
  alt="Lien Arizon"
  width={176}
  height={71}
  className="mx-auto"
  />
  </div>

  <span className="w-0.5 h-16 bg-white self-center mx-2"></span>


  <div className="size-1/3 text-white grow-3 text-center p-5 justify-center">
    <p>
    Email
  </p>
  <p>
    ambed@agrios.com
  </p>
  </div>

      </div>
    </>
  );
}
