'use client'
import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableHead, TableBody, TableRow, TableCell, Card, CardContent } from '@mui/material';
import { CheckCircle } from 'lucide-react';
import { GET } from '@/utils/AxiosUtility';
import { useSearchParams } from 'next/navigation';

const htmlToPlainText = (htmlString: string): string => {
  if (!htmlString) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  return tempDiv.textContent || tempDiv.innerText || '';
};

function getOperatorText(operator: string): string {
  switch (operator) {
    case '==':
      return 'Equal To';
    case '!=':
      return 'Not Equal';
    case '>':
      return 'Greater Than';
    case '>=':
      return 'Greater Than or Equal';
    case '<':
      return 'Less Than';
    case '<=':
      return 'Less Than or Equal';
    default:
      return operator; // fallback if unrecognized
  }
}

const CampaignDetails = () => {
  const params = useSearchParams();
  const paramId =  params.get('id') || null;
  const [campaign, setCampaign] = useState<any>(null);
  const [benefitsList, setBenefitsList] = useState<any>([]);

  useEffect(() => {
    if (paramId) {
      GET(`/campaigns/single/${paramId}`).then((res: any) => {
        if (res?.data) {
          const data = res.data;
          setCampaign(data);

          const all: any = new Set();
          data.tiers.forEach((ct: any) => {
            const html = ct.tier?.benefits || '';
            const div = document.createElement('div');
            div.innerHTML = html;
            const items = div.querySelectorAll('li');
            ct._parsedBenefits = [];
            items.forEach((li) => {
              const txt = li.textContent?.trim();
              if (txt) {
                ct._parsedBenefits.push(txt);
                all.add(txt);
              }
            });
          });

          setBenefitsList(Array.from(all));
        }
      });
    }
  }, [paramId]);

  if (!campaign) return null;

  const cardColors = [
    '#e0f7fa', // light cyan
    '#e8f5e9', // light green
    '#ede7f6', // light indigo
  ];

  const rowColors = [
    '#e0f7fa', // light green
    '#f0f0f0'
  ];

  return (
    <Box px={4} py={6}>
      <Typography variant="h4" gutterBottom>{campaign.name}</Typography>
      <Typography variant="body1" gutterBottom>{htmlToPlainText(campaign.description)}</Typography>

      {/* Tier Benefits Grid */}
      <Paper sx={{ mt: 4 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
            <TableRow>
              <TableCell>Benefits</TableCell>
              {campaign.tiers.map((ct: any, i: number) => (
                <TableCell key={i} align="center">
                  <Typography fontWeight={700} sx={{ color: ct.tier.color || '#000' }}>{ct.tier.name}</Typography>
                  <Typography variant="body2">Points {ct.tier.min_points}</Typography>
                  <Typography variant="caption">Rate: {ct.point_conversion_rate}x</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {benefitsList.map((b: any, i: number) => {
              const bgColor = rowColors[i % rowColors.length];
              return (
                <TableRow key={i} sx={{ backgroundColor: bgColor }}>
                  <TableCell>
                    <span dangerouslySetInnerHTML={{ __html: b }} />
                  </TableCell>
                  {campaign.tiers.map((ct: any, j: number) => (
                    <TableCell key={j} align="center">
                      {ct._parsedBenefits?.includes(b) && (
                        <CheckCircle color={ct.tier.color || '#4caf50'} size={20} />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {/* Ways to Earn Points */}
      <Box mt={6}>
        <Typography variant="h5" gutterBottom>🌟 Ways to Earn Points</Typography>
        <Box
          display="grid"
          gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }}
          gap={3}
          mt={2}
        >
          {campaign.rules.map((r: any, i: number) => {
            const bgColor = cardColors[i % cardColors.length];

            if (r.rule.rule_type === 'event based earn') {
              return (
                <Card key={i} elevation={3} sx={{ backgroundColor: bgColor }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" fontWeight={600}>
                      {r.rule.name}
                    </Typography>
                    <Typography>Get {r.rule.reward_points} Points</Typography>
                  </CardContent>
                </Card>
              );
            } else if (r.rule.rule_type === 'spend and earn') {
              return (
                <Card key={i} elevation={3} sx={{ backgroundColor: bgColor }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography fontWeight={600}>
                      Get {r.rule.reward_points} Points
                    </Typography>
                    <Typography>
                      By Spending {r.rule.min_amount_spent} SAR
                    </Typography>
                  </CardContent>
                </Card>
              );
            } else if (r.rule.rule_type === 'dynamic rule') {
              return (
                <Card key={i} elevation={3} sx={{ backgroundColor: bgColor }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography fontWeight={600}>
                      Get {r.rule.reward_points} Points
                    </Typography>
                    <Typography variant="body1">
                      If {r.rule.condition_type} is{' '}
                      {getOperatorText(r.rule.condition_operator)}{' '}
                      {r.rule.condition_value}
                    </Typography>
                  </CardContent>
                </Card>
              );
            } else {
              return null;
            }
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default CampaignDetails;
