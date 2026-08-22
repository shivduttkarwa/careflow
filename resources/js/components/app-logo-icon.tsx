import type { SVGAttributes } from 'react';
import { BrandMark } from '@/components/brand';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return <BrandMark {...props} />;
}
