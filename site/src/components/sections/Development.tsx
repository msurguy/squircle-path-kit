import { CodeBlock } from "../ui/CodeBlock";
import { DocSection } from "./DocSection";

const scripts = `npm install
npm run dev        # local example site
npm test           # builds library + runs tests
npm run build      # builds library + GitHub Pages site
npm run pack:check # verify npm package contents`;

export function Development() {
  return (
    <>
      <DocSection id="contributing" kicker="Development" title="Contributing">
        <p>
          Issues and pull requests are welcome on{" "}
          <a href="https://github.com/msurguy/squircle-path-kit" target="_blank" rel="noreferrer">
            GitHub
          </a>
          . The construction is verified against Figma ground truth in the test suite — if you
          change the geometry, the parity tests will tell you within 0.01px.
        </p>
      </DocSection>

      <DocSection id="scripts" kicker="Development" title="Scripts">
        <p>
          The Vite/React example site (this page) is development tooling only and is not part of
          the npm package tarball.
        </p>
        <CodeBlock code={scripts} lang="BASH" plain sketchClass="sketch--b tilt-r" />
        <p>Released under the MIT license.</p>
      </DocSection>
    </>
  );
}
