const ContactSection = () => {
  const contactInfo = [
    {
      icon: '📍',
      title: 'Address',
      lines: ['123 Hotel Complex Avenue', 'City Center, State 12345'],
    },
    {
      icon: '📞',
      title: 'Phone',
      lines: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
    },
    {
      icon: '✉️',
      title: 'Email',
      lines: ['info@hotelcomplex.com', 'reservations@hotelcomplex.com'],
    },
    {
      icon: '🕐',
      title: 'Hours',
      lines: ['Front Desk: 24/7', 'Restaurant: 6AM - 11PM', 'Bar: 11AM - 2AM'],
    },
  ];

  return (
    <section id="contact" className="section bg-secondary-900 text-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary-400 font-medium mb-2 block">Contact Us</span>
          <h2 className="section-title text-white">Get in Touch</h2>
          <p className="section-subtitle text-secondary-400">
            Have questions? We'd love to hear from you
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-6">
              {contactInfo.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h4 className="font-semibold mb-2">{item.title}</h4>
                    {item.lines.map((line, i) => (
                      <p key={i} className="text-secondary-400 text-sm">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="mt-8">
              <h4 className="font-semibold mb-4">Location</h4>
              <div className="h-64 bg-secondary-800 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl block mb-2">🗺️</span>
                  <p className="text-secondary-400">Map Loading...</p>
                  <p className="text-secondary-500 text-sm">123 Hotel Complex Avenue</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 text-secondary-900">
            <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="label">Subject</label>
                <select className="input">
                  <option value="">Select a subject</option>
                  <option value="reservation">Room Reservation</option>
                  <option value="dining">Dining & Menu</option>
                  <option value="events">Events & Weddings</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="label">Message</label>
                <textarea
                  className="input min-h-[120px]"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button type="submit" className="btn-primary w-full">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

