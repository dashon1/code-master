import React, { useState } from 'react';
import { createCheckoutSession } from '@/functions/createCheckoutSession';
import { Check, Zap, Users, Code } from 'lucide-react';

const PRICE_IDS = {
  pro:  'price_1TKTh90xw5o9mCvnPfQfxWpe',  // Pro $19.99/mo
  team: 'price_1TKThA0xw5o9mCvnFzm1fPQU',  // Team $49.99/mo
};

const plans = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Start learning to code with the basics.',
    icon: Code,
    color: 'from-gray-500 to-gray-600',
    features: [
      'Access to Python & JavaScript intro modules',
      'Basic coding challenges',
      '3 practice problems per day',
      'Community forum access',
    ],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    key: 'pro',
    name: 'Pro Scholar',
    price: '$19.99',
    period: '/mo',
    description: 'Everything you need to master coding.',
    icon: Zap,
    color: 'from-blue-500 to-purple-600',
    features: [
      'All courses — Python, JavaScript, Java, C, SQL',
      'Unlimited coding challenges & practice',
      'AI Practice Builder & Personalized Path',
      'Interview Prep module',
      'Projects & Certifications',
      'Tournament access',
      'Priority support',
    ],
    cta: 'Start Pro — $19.99/mo',
    highlight: true,
  },
  {
    key: 'team',
    name: 'Team',
    price: '$49.99',
    period: '/mo',
    description: 'For study groups, bootcamps, and teams.',
    icon: Users,
    color: 'from-orange-500 to-pink-500',
    features: [
      'Everything in Pro Scholar',
      'Up to 10 team members',
      'Team leaderboards & tournaments',
      'Shared workspaces & projects',
      'Team progress dashboard',
      'Dedicated account support',
    ],
    cta: 'Start Team — $49.99/mo',
    highlight: false,
  },
];

export default function Pricing() {
  const [loading, setLoading] = useState(null);

  const handleUpgrade = async (planKey) => {
    if (planKey === 'free') return;
    setLoading(planKey);
    try {
      const { data } = await createCheckoutSession({
        priceId: PRICE_IDS[planKey],
        successUrl: window.location.origin + '?checkout=success',
        cancelUrl: window.location.origin + '/Pricing',
      });
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            UCodeWise Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            From beginner to job-ready. Choose the plan that fits your goals.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.key}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-blue-600/20 to-purple-600/20 border-2 border-blue-500 shadow-2xl shadow-blue-500/20'
                    : 'bg-slate-800/60 border border-slate-700'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                <p className="text-slate-400 text-sm mb-4">{plan.description}</p>

                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400 mb-1">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={loading === plan.key}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
                      : plan.key === 'free'
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {loading === plan.key ? 'Redirecting...' : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-500 text-sm mt-10">
          All paid plans include a 7-day free trial. Cancel anytime. Secure checkout via Stripe.
        </p>
      </div>
    </div>
  );
}
