const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} Farm Earn. All rights reserved.</p>
                <p className="mt-2 text-xs">Connecting Farmers and Buyers seamlessly.</p>
            </div>
        </footer>
    );
};

export default Footer;
