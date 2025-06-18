import React, { useState } from 'react';
import LoadingSpinner from './common/LoadingSpinner';

const Newsletter = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setStatus({
        loading: false,
        success: false,
        error: 'Please fill in all fields'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus({
        loading: false,
        success: false,
        error: 'Please enter a valid email address'
      });
      return;
    }

    setStatus({ loading: true, success: false, error: null });

    try {
      // Simulate API call - replace with actual newsletter service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, we'll just show success
      // In a real app, you'd integrate with services like:
      // - Mailchimp
      // - ConvertKit
      // - SendGrid
      // - Your own backend API
      
      setStatus({
        loading: false,
        success: true,
        error: null
      });
      
      // Reset form
      setFormData({ name: '', email: '' });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 5000);
      
    } catch (error) {
      setStatus({
        loading: false,
        success: false,
        error: 'Failed to subscribe. Please try again later.'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (status.error) {
      setStatus(prev => ({ ...prev, error: null }));
    }
  };

  return (
    <div className="section-newsletter">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="text-center">
              <h2>
                Stay Updated with
                <span className="text-resalt"> Sports News</span>
              </h2>
              <p>
                Get the latest football news, match results, and exclusive content 
                delivered straight to your inbox. Never miss a goal or breaking news again!
              </p>
            </div>
            
            <form id="newsletterForm" onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-addon">
                      <i className="fa fa-user"></i>
                    </span>
                    <input
                      className={`form-control ${status.error && !formData.name.trim() ? 'error' : ''}`}
                      placeholder="Your Name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={status.loading}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-addon">
                      <i className="fa fa-envelope"></i>
                    </span>
                    <input
                      className={`form-control ${status.error && !formData.email.trim() ? 'error' : ''}`}
                      placeholder="Your Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={status.loading}
                    />
                    <span className="input-group-btn">
                      <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={status.loading}
                      >
                        {status.loading ? (
                          <>
                            <LoadingSpinner size="small" />
                            SIGNING UP...
                          </>
                        ) : (
                          'SIGN UP'
                        )}
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            </form>
            
            <div id="result-newsletter">
              {status.success && (
                <div className="alert alert-success">
                  <i className="fa fa-check-circle"></i>
                  <strong>Success!</strong> You've been subscribed to our newsletter. 
                  Check your email for confirmation.
                </div>
              )}
              
              {status.error && (
                <div className="alert alert-danger">
                  <i className="fa fa-exclamation-triangle"></i>
                  <strong>Error:</strong> {status.error}
                </div>
              )}
            </div>
            <br></br>
            
            <div className="newsletter-features">
              <div className="row">
                <div className="col-md-4">
                  <div className="feature-item">
                    <i className="fa fa-newspaper-o"></i>
                    <h5>Daily Updates</h5>
                    <p>Get daily sports news and match highlights</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="feature-item">
                    <i className="fa fa-bell"></i>
                    <h5>Breaking News</h5>
                    <p>Be the first to know about transfers and results</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="feature-item">
                    <i className="fa fa-star"></i>
                    <h5>Exclusive Content</h5>
                    <p>Access to premium analysis and insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      
    </div>
  );
};

export default Newsletter;