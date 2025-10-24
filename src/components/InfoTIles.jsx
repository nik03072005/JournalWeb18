import { BookOpen, GraduationCap, Archive, Globe2 } from 'lucide-react';

const tiles = [
  {
    title: "Digital Books",
    description: "Access over 500K+ e-books across all academic disciplines",
    icon: BookOpen,
    bg: "bg-gradient-to-br from-blue-50 to-blue-100",
    iconBg: "bg-gradient-to-br from-blue-500 to-cyan-400",
  },
  {
    title: "Research Journals",
    description: "Peer-reviewed articles from top academic publishers worldwide",
    icon: GraduationCap,
    bg: "bg-gradient-to-br from-pink-50 to-purple-100",
    iconBg: "bg-gradient-to-br from-pink-500 to-purple-500",
  },
  {
    title: "Data Archives",
    description: "Comprehensive datasets and research repositories",
    icon: Archive,
    bg: "bg-gradient-to-br from-green-50 to-green-100",
    iconBg: "bg-gradient-to-br from-green-500 to-teal-400",
  },
  {
    title: "Online Tools",
    description: "Advanced search, citation tools, and research assistants",
    icon: Globe2,
    bg: "bg-gradient-to-br from-orange-50 to-red-100",
    iconBg: "bg-gradient-to-br from-orange-500 to-red-500",
  },
];

export default function InfoTiles() {
  return (
    <section className="py-20 px-6 md:px-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
          Explore Our Collections
        </h2>
        <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Discover vast resources across multiple disciplines with cutting-edge search and discovery tools
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {tiles.map((tile, idx) => {
          const Icon = tile.icon;
          return (
            <div
              key={idx}
              className={`${tile.bg} rounded-3xl cursor-pointer shadow-lg border border-gray-100 p-8 hover:shadow-xl hover:scale-105 transition duration-300 group`}
            >
              {/* Icon Box */}
              <div
                className={`${tile.iconBg} w-16 h-16 flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                <Icon className="h-8 w-8 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-800 mb-3">{tile.title}</h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {tile.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}