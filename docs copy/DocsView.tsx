import React, { useState, useEffect, useRef, useCallback } from "react";
import overlay from "../../assets/backgrounds/noise_overlay-7.webp";
import logoDocs from "../../assets/logo/docs-sqwish.webp";
import CodeSnippet from "./components/CodeSnippet";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<"python" | "javascript" | "curl">("python");
  const [activeSection, setActiveSection] = useState<string>("introduction");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // State for headroom-like behavior of the top bar
  const [showTopBar, setShowTopBar] = useState(true);
  const [lastScrollPos, setLastScrollPos] = useState(0);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const sections = [
    { id: "introduction", label: "Introduction", subSections: [] },
    { id: "setup", label: "Setup", subSections: [] },
    { id: "getting-started", label: "Getting Started", subSections: [] },
    { id: "api-reference", label: "API Reference", subSections: ["Optimize Endpoint"] },
    { id: "troubleshooting", label: "Troubleshooting", subSections: [] },
    { id: "use-cases", label: "Use Cases", subSections: [] },
  ];

  const filteredSections = sections.filter(
    (section) =>
      section.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.subSections.some((sub) => sub.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const codeBlocks = {
    setup: {
      javascript: `npm install sqwishai

// Then set your API key as an environment variable
// process.env.SQWISH_API_KEY = "YOUR_API_KEY"`,
      python: `pip install sqwishai

# Then set your API key as an environment variable or in your code:
# import os
# os.environ["SQWISH_API_KEY"] = "YOUR_API_KEY"`,
      curl: `# There's no installation via curl. 
# Just ensure you have an API key. E.g.:
# export SQWISH_API_KEY=YOUR_API_KEY`,
    },
    gettingStarted: {
      javascript: `const { Sqwish } = require('sqwishai');
const sqwishClient = new Sqwish(process.env.SQWISH_API_KEY);

const inputPrompt = "Write a haiku about recursion in programming.";
const response = sqwishClient.text.optimize(inputPrompt)`,
      python: `from sqwishai import Sqwish
import os

sqwish_client = Sqwish(os.environ.get("SQWISH_API_KEY"))

input_prompt = "Write a haiku about recursion in programming."
response = sqwish_client.text.optimize(input_prompt)`,
      curl: `curl -X POST "https://api.sqwish.ai/v1/optimization/optimize" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $SQWISH_API_KEY" \\
  -d '{
    "text": "Write a haiku about recursion in programming.",
    "target_model": "gpt4o",
    "optimization_model": "latest"
}'`,
    },
    restApiExample: {
      javascript: `// Using fetch in JavaScript:
fetch("https://api.sqwish.ai/v1/optimization/optimize", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.SQWISH_API_KEY}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    text: "Write a detailed blog post about recursion in programming.",
    target_model: "gpt4o",
    optimization_model: "latest"
  })
})
.then(response => response.json())
.then(data => {
  console.log("Optimized message:", data.message);
  console.log("Tokens Saved:", data.tokens_reduced);
});`,
      python: `import requests, os

headers = {
  "Authorization": f"Bearer {os.environ.get('SQWISH_API_KEY')}",
  "Content-Type": "application/json"
}

payload = {
  "text": "Write a detailed blog post about recursion in programming.",
  "target_model": "gpt4o",
  "optimization_model": "latest"
}

response = requests.post("https://api.sqwish.ai/v1/optimization/optimize", json=payload, headers=headers)
data = response.json()

print("Optimized message:", data["message"])
print("Tokens Saved:", data["tokens_reduced"])`,
      curl: `curl -X POST "https://api.sqwish.ai/v1/optimization/optimize" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $SQWISH_API_KEY" \\
  -d '{
    "text": "Write a detailed blog post about recursion in programming.",
    "target_model": "gpt4o",
    "optimization_model": "latest"
}'`,
    },
  };

  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  sectionRefs.current = sections.map((_, i) => sectionRefs.current[i] || null);

  useEffect(() => {
    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          if (id) setActiveSection(id);
        }
      });
    };

    const observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: "0px",
      threshold: 0.6,
    });

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionRefs.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  // Handle hiding/showing top bar on scroll (headroom-like behavior)
  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      const currentScrollPos = mainElement.scrollTop;
      if (currentScrollPos > lastScrollPos && currentScrollPos > 100) {
        // scrolling down and past threshold
        setShowTopBar(false);
      } else {
        // scrolling up or not far down
        setShowTopBar(true);
      }
      setLastScrollPos(currentScrollPos);
    };

    mainElement.addEventListener("scroll", handleScroll);
    return () => {
      mainElement.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollPos]);

  const handleOverlayClick = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isSearchInput = target.closest('input[type="text"]');
    const isNavSection = target.closest("nav ul");
    if (!isSearchInput && !isNavSection) {
      setIsMenuOpen(false);
    }
  }, []);

  return (
    <div className="relative w-full text-black flex flex-col">
      <div className="fixed inset-0 overflow-hidden -z-10">
        <img src={overlay} alt="background" className="w-auto h-full object-cover object-center min-w-full" />
      </div>

      <div className="flex flex-1 overflow-hidden relative h-full">
        {/* Overlay for closing menu on outside click */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-white/50 bg-opacity-30 z-30 md:hidden" onClick={handleOverlayClick}></div>
        )}

        {/* Sidebar – now styled like the main platform’s VerticalNav  */}
        <aside
          ref={sidebarRef}
          className={`fixed md:static top-0 left-0 h-screen w-64
            bg-white shadow-lg border-r flex flex-col
            transition-transform duration-300 ease-in-out z-[45]
            ${isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
          onClick={handleMenuClick}
        >
          {/* Logo */}
          <div className="hidden md:flex flex-col items-center pt-[90px] pb-6">
            <img src={logoDocs} alt="docs" className="w-40 h-auto" />
          </div>

          {/* Search */}
          <div className="px-4 mb-4 md:mb-6">
            <input
              type="text"
              placeholder="Search..."
              className="w-full py-2 px-4 border border-gray-300 rounded-full"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2">
            {filteredSections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <div key={section.id} className="mb-1">
                  <a
                    href={`#${section.id}`}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors
                      ${isActive ? "bg-gray-200 font-semibold shadow" : "hover:bg-gray-100"}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {section.label}
                  </a>

                  {/* Sub-sections */}
                  {section.subSections.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1">
                      {section.subSections.map((sub) => {
                        const subId = `${section.id}-${sub.toLowerCase().replace(/\s+/g, "-")}`;
                        const isSubActive = activeSection === subId;
                        return (
                          <a
                            key={sub}
                            href={`#${subId}`}
                            className={`block text-sm px-3 py-1 rounded-lg transition-colors
                              ${isSubActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {sub}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main Content: Make this scrollable and contain the top bar for mobile */}
        <main ref={mainRef} className="flex-1 w-full px-4 md:px-12 overflow-y-auto h-screen relative">
          {/* Top bar (mobile only) with headroom behavior - z-40 by default */}
          <div
            className={`
              md:hidden flex justify-between items-center px-4 py-2 
              bg-white/50 backdrop-blur-sm border-b border-gray-200 
              sticky top-0 transform transition-transform duration-300 ease-in-out
              z-40
              ${showTopBar ? "translate-y-0" : "-translate-y-full"}
            `}
          >
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-black focus:outline-none pt-[80px]"
              title="Toggle Menu"
            >
              {isMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <img src={logoDocs} alt="docs" className="pt-[80px] w-[140px] h-auto" />
            <div className="w-6" />
          </div>

          <section
            id="introduction"
            ref={(el) => (sectionRefs.current[0] = el)}
            className="my-8 relative md:pt-[80px]"
            style={{ scrollMarginTop: "80px" }}
          >
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p className="mb-4">
              Welcome to the Sqwish API documentation. This guide will help you understand how to use our real-time
              prompt optimization API.
            </p>
            <p className="mb-4">
              With Sqwish, you can optimize long text prompts into shorter, token-efficient versions, saving computation
              and costs when working with large language models.
            </p>
          </section>

          {/* Global Language Selector */}
          <div className="relative max-w-full flex flex-col lg:flex-row justify-end items-center mb-4 overflow-x-auto">
            <div className="px-5 whitespace-nowrap text-sm lg:text-base max-lg:pb-2">
              <strong>Select your preferred language:</strong>
            </div>
            <div className="inline-flex p-1.5 lg:p-2 rounded-full space-x-1 lg:space-x-2 bg-[#353941]">
              {[
                { id: "python", label: "Python" },
                { id: "curl", label: "curl" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedLanguage(tab.id as "python" | "javascript" | "curl")}
                  className={`text-center px-3 lg:px-4 py-1.5 rounded-full whitespace-nowrap 
                    ${
                      selectedLanguage === tab.id
                        ? "bg-white text-black font-semibold shadow"
                        : "bg-white/60 text-black hover:bg-white/80"
                    } w-20 lg:w-28 text-xs lg:text-base`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <section
            id="setup"
            ref={(el) => (sectionRefs.current[1] = el)}
            className="my-8 relative"
            style={{ scrollMarginTop: "80px" }}
          >
            <h2 className="text-2xl font-bold mb-4">Setup</h2>
            <div className="flex text-center justify-center max-w-[700px] py-[10px]">
              <p className="bg-gray-100 w-[400px] pl-[18px] py-[10px] rounded-lg shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_3px_8px_rgba(0,0,0,0.25)]">
                Generate and manage your API Keys{" "}
                <Link
                  to="/profile/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  // onClick={ } //handleSignupLinkClick
                  className="text-black underline hover:text-blue-600 transition-colors duration-200"
                >
                  here
                </Link>
                .
              </p>
            </div>
            <p className="mb-4">
              Below are the instructions to install and initialize the Sqwish client library in your preferred language:
            </p>
            <CodeSnippet code={codeBlocks.setup[selectedLanguage]} />
          </section>

          <section
            id="getting-started"
            ref={(el) => (sectionRefs.current[2] = el)}
            className="my-8 relative"
            style={{ scrollMarginTop: "80px" }}
          >
            <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
            <p>
              After setting your API key, you can optimize prompts easily. Here's a quick example showing how to
              optimize a prompt and inspect additional metadata returned by the API:
            </p>
            <CodeSnippet code={codeBlocks.gettingStarted[selectedLanguage]} />
          </section>

          <section
            id="api-reference"
            ref={(el) => (sectionRefs.current[3] = el)}
            className="my-8 relative"
            style={{ scrollMarginTop: "80px" }}
          >
            <h2 className="text-2xl font-bold mb-4">API Reference</h2>
            <p className="mb-4">
              Our API provides endpoints for optimizing text prompts in real-time. The main endpoint is{" "}
              <code>/v1/optimization/optimize</code>.
            </p>
            <section
              id="api-reference-optimize-endpoint"
              ref={(el) => (sectionRefs.current[4] = el)}
              className="my-4 relative"
              style={{ scrollMarginTop: "80px" }}
            >
              <h3 className="text-xl font-semibold">Optimize Endpoint</h3>
              <p className="mt-2">
                Endpoint: <code>/v1/optimization/optimize</code>
              </p>
              <p>
                Method: <code>POST</code>
              </p>
              <p className="mt-2">Parameters:</p>
              <ul className="list-disc ml-6">
                <li>
                  <code>text</code> (string): The text prompt to optimize.
                </li>
              </ul>
              <p>The JSON response includes:</p>
              <ul className="list-disc ml-6">
                <li>
                  <strong>message:</strong> The optimized text.
                </li>
                <li>
                  <strong>tokens_reduced:</strong> Number of tokens saved by optimizing.
                </li>
              </ul>
              <p className="list-disc mt-2 mb-2">
                Here is an example making a REST API call directly to the optimization endpoint. You can easily
                integrate this into any application or system:
              </p>
              <CodeSnippet code={codeBlocks.restApiExample[selectedLanguage]} />
            </section>
          </section>

          <section
            id="troubleshooting"
            ref={(el) => (sectionRefs.current[6] = el)}
            className="my-8 relative"
            style={{ scrollMarginTop: "80px" }}
          >
            <h2 className="text-2xl font-bold mb-4">Troubleshooting</h2>
            <p>If you encounter issues, here are some common errors and solutions:</p>
            <ul className="list-disc ml-6">
              <li>
                <strong>Error 401:</strong> Check your API key and ensure it is valid.
              </li>
              <li>
                <strong>Error 500:</strong> Server error. Try again later or contact support.
              </li>
            </ul>
          </section>

          <section
            id="use-cases"
            ref={(el) => (sectionRefs.current[7] = el)}
            className="my-8 relative"
            style={{ scrollMarginTop: "80px" }}
          >
            <h2 className="text-2xl font-bold mb-4">Use Cases</h2>
            <p className="mb-4">Explore how the Sqwish API can be used in various scenarios:</p>
            <ul className="list-disc ml-6">
              <li>Reduce latency in real-time or low-latency environments (e.g. finance, analytics).</li>
              <li>Handle longer documents or complex queries within a single context window.</li>
              <li>Keep chatbots snappy even as conversations grow.</li>
              <li>
                Use optimized multi-shot examples for chain of thought prompting—fewer tokens, faster thinking, same
                reasoning.
              </li>
              <li>Fit more documents into retrieval-augmented generation (RAG) flows.</li>
              <li>Lower costs for frequent short prompts by optimization every time.</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
