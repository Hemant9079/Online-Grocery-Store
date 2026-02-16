import './Bottom.css';

const Bottom = () => {
    return (
        <div className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Contact Us</h3>
                    <p>Name: Hemant Kumar</p>
                    <p>Email: <a href="mailto:hkumar954995@gmail.com" className="footer-link">hkumar954995@gmail.com</a></p>
                    <p>Address: 123 Grocery Lane, Market City, India 110001</p>
                </div>

                <div className="footer-section">
                    <h3>Complaints</h3>
                    <p>Have an issue? Let us know directly.</p>
                    <a href="mailto:hkumar954995@gmail.com?subject=Complaint Issue" className="complain-btn">
                        Send Complaint
                    </a>
                </div>
            </div>
            <p style={{ marginTop: '20px', fontSize: '12px' }}>© {new Date().getFullYear()} Online Grocery Store. All rights reserved.</p>
        </div>
    );
};

export default Bottom;
