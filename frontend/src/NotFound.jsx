import { Link } from "react-router-dom";
import { ButtonLink } from "./components/Button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-8xl font-black text-surface-200 mb-4">404</div>
            <h1 className="text-3xl font-bold text-surface-900 mb-3">Page Not Found</h1>
            <p className="text-surface-500 mb-8 max-w-md">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <ButtonLink link="/" variant="primary" size="lg">
                Back to Home
            </ButtonLink>
        </div>
    );
}
