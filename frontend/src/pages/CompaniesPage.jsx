import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { companyAPI } from "../api";
import { Users, Star, Search, TrendingUp, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companyAPI.getAll().then((r) => r.data.data),
  });

  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    return companies.filter((c: any) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [companies, search]);

  const totalStudents =
    companies?.reduce((acc: number, c: any) => acc + (c.totalStudents || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface via-white to-surface overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 w-[700px] h-[700px] bg-primary/10 blur-[120px] rounded-full -translate-x-1/2" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            to="/"
            className="font-display text-3xl font-black tracking-tight"
          >
            X<span className="text-primary">1</span>
          </Link>

          <div className="hidden md:flex gap-8 text-sm text-gray-600">
            <Link to="/" className="hover:text-primary transition">
              Home
            </Link>
            <Link to="/companies" className="text-primary font-semibold">
              Companies
            </Link>
          </div>

          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-5 py-2 rounded-xl border border-gray-200 hover:border-primary hover:text-primary transition"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="px-5 py-2 rounded-xl bg-primary text-white hover:scale-105 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6">
            <Building2 size={16} />
            Company Interview Tracks
          </span>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Prepare for your
            <span className="block text-primary">dream company</span>
          </h1>

          <p className="text-gray-500 max-w-2xl mx-auto mt-6 text-lg">
            Every company track is built around real hiring rounds,
            coding patterns, aptitude tests, and interview experiences.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto mt-10 relative">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search Google, Amazon, Infosys..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-5 py-4 rounded-2xl border border-gray-200 bg-white shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/20 transition"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 pb-14">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: Building2,
              value: companies?.length || 0,
              label: "Company Tracks",
            },
            {
              icon: Users,
              value: totalStudents.toLocaleString(),
              label: "Learners",
            },
            {
              icon: TrendingUp,
              value: "95%",
              label: "Success Stories",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-lg"
            >
              <stat.icon className="text-primary mb-3" size={28} />
              <h3 className="text-3xl font-black">{stat.value}</h3>
              <p className="text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Companies Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                repeat: Infinity,
                duration: 1,
                ease: "linear",
              }}
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            No companies found.
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCompanies.map((c: any) => (
              <motion.div
                key={c._id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                }}
                transition={{ type: "spring", stiffness: 220 }}
                className="group bg-white rounded-3xl border border-gray-100 p-6 shadow-lg hover:shadow-2xl transition-all relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500"
                  style={{
                    background: `linear-gradient(135deg,${
                      c.color || "#5B3BF5"
                    }15,transparent)`,
                  }}
                />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black shadow-md"
                      style={{
                        background: c.color || "#5B3BF5",
                      }}
                    >
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>

                    {c.isFeatured && (
                      <span className="flex items-center gap-1 text-xs font-bold bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">
                        <Star size={12} fill="currentColor" />
                        Popular
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold">{c.name}</h3>
                  <p className="text-gray-400 capitalize mt-1">
                    {c.category} Company
                  </p>

                  {c.selectionRate > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Selection Rate</span>
                        <span className="font-semibold text-green-600">
                          {c.selectionRate}%
                        </span>
                      </div>

                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${c.selectionRate}%` }}
                          transition={{ duration: 1 }}
                          className="h-full bg-green-500 rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-5">
                    <Users size={16} />
                    {(c.totalStudents || 0).toLocaleString()} learners
                  </div>

                  <div className="flex justify-between items-center mt-8">
                    <div>
                      <p className="text-xs text-gray-400">Starting from</p>
                      <h2 className="text-3xl font-black text-primary">
                        ₹{c.price}
                      </h2>
                    </div>

                    <Link
                      to="/signup"
                      className="px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:scale-105 transition"
                    >
                      Start Prep →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
