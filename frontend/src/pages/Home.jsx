import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="relative isolate bg-gray-50">
      {/* Hero Section */}
      <div className="relative pt-16 pb-24 sm:pt-20 sm:pb-32 lg:pb-48 overflow-hidden">
        {/* Background Gradient with Subtle Texture */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-50 to-gray-100 opacity-80">
          <div
            className="absolute inset-x-0 -top-40 transform-gpu blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-300 to-primary-500 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
              }}
            />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Discover Your Dream Home
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              Explore a curated selection of properties for rent, from cozy apartments to luxurious
              houses, tailored to your lifestyle.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/easyrent-explore"
                className="rounded-md bg-primary-600 px-4 py-3 text-base font-semibold text-white shadow-md hover:bg-primary-700 hover:scale-105 transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                aria-label="Browse available properties"
              >
                Browse Properties
              </Link>
              <Link
                to="/easyrent-signup"
                className="text-base font-semibold leading-6 text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                aria-label="Sign up to list your property"
              >
                List Your Property <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center animate-fade-in-up">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Featured Properties
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 sm:text-xl">
            Discover our handpicked selection of top properties available now.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {/* Placeholder Property Card 1 */}
          <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in-up">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              <div className="flex h-full items-center justify-center text-gray-400">
                Easy Rent
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                Cozy Downtown Apartment
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                2 Bed • 1 Bath • $1,200/mo
              </p>
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                A modern apartment in the heart of the city with easy access to amenities.
              </p>
              <Link
                to="/easyrent-login"
                className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
                aria-label="Log in to view Cozy Downtown Apartment details"
              >
                View Details
              </Link>
            </div>
          </div>
          {/* Placeholder Property Card 2 */}
          <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in-up">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              <div className="flex h-full items-center justify-center text-gray-400">
                Property Image
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                Spacious Family House
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                4 Bed • 3 Bath • $2,500/mo
              </p>
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                A beautiful house with a large backyard, perfect for families.
              </p>
              <Link
                to="/easyrent-login"
                className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
                aria-label="Log in to view Spacious Family House details"
              >
                View Details
              </Link>
            </div>
          </div>
          {/* Placeholder Property Card 3 */}
          <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in-up">
            <div className="aspect-w-16 aspect-h-9 bg-gray- personally200">
              <div className="flex h-full items-center justify-center text-gray-400">
                Property Image
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                Modern Studio Loft
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                1 Bed • 1 Bath • $900/mo
              </p>
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                A stylish loft with open-plan living in a vibrant neighborhood.
              </p>
              <Link
                to="/easyrent-login"
                className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
                aria-label="Log in to view Modern Studio Loft details"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div
        className="absolute inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary-300 to-primary-500 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  );
}