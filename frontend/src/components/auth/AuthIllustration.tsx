import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle } from "lucide-react";

interface AuthIllustrationProps {
  mode: "signin" | "signup";
  isAnimating?: boolean;
}

const authImages = {
  signin: "/images/auth-signin.jpg",
  signup: "/images/auth-signup.jpg",
};

const features = {
  signin: [
    "Secure role-based access control",
    "Real-time academic operations",
    "Student-centered learning workflows",
    "Multi-department support",
  ],
  signup: [
    "7-day free trial included",
    "No credit card required",
    "Full platform access",
    "Dedicated onboarding support",
  ],
};

export function AuthIllustration({ mode, isAnimating = false }: AuthIllustrationProps) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={authImages[mode]}
            alt="Educational professionals"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(222,47%,6%,0.9)] via-[hsl(222,47%,11%,0.8)] to-[hsl(222,47%,11%,0.7)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(222,47%,6%,0.6)] to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-12">
        <AnimatePresence mode="wait">
          {!isAnimating && (
            <motion.div
              key={`content-${mode}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center max-w-lg"
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {mode === "signin" ? "Welcome Back" : "Join NexfordEdu Today"}
                </h2>
                <p className="text-gray-300 text-lg">
                  {mode === "signin" 
                    ? "Access your academic dashboard and continue delivering excellent education."
                    : "Create your institutional account and unlock enterprise-grade education management."
                  }
                </p>
              </motion.div>

              {/* Feature List */}
              <div className="space-y-4 text-left">
                {features[mode].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-white font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-400"
              >
                <Shield className="w-4 h-4 text-primary" />
                <span>Trusted by 200+ Global Educational Institutions</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
    </div>
  );
}
