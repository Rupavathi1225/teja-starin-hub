export const Footer = () => {
  return (
    <footer className="bg-muted mt-16 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            All content provided on this page is carefully researched, written, and reviewed to 
            maintain a high level of accuracy and reliability. While every effort is made to ensure 
            the information is current and useful, it is shared for general educational and 
            informational purposes only. The material on this page should not be interpreted as 
            professional advice, diagnosis, or treatment in any area, including financial, medical, 
            or legal matters. Readers are strongly advised to verify information independently and 
            consult qualified professionals before making any personal, financial, health, or legal 
            decisions based on the content presented here.
          </p>
        </div>
        <div className="text-center mt-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} tejastarin. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
