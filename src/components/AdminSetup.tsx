
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Shield, User, Mail } from 'lucide-react';

export const AdminSetup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const makeUserAdmin = async () => {
    if (!email) {
      toast({
        title: "E-Mail erforderlich",
        description: "Bitte geben Sie eine E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Making user admin:', email);
      
      // Find user by email and make them admin
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('email', email.toLowerCase())
        .select();

      if (error) {
        console.error('Error making user admin:', error);
        toast({
          title: "Fehler",
          description: "Benutzer konnte nicht zum Admin gemacht werden. Überprüfen Sie die E-Mail-Adresse.",
          variant: "destructive",
        });
        return;
      }

      if (!data || data.length === 0) {
        toast({
          title: "Benutzer nicht gefunden",
          description: "Kein Benutzer mit dieser E-Mail-Adresse gefunden.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Admin erstellt",
        description: `${email} wurde erfolgreich zum Administrator gemacht.`,
      });
      
      setEmail('');
    } catch (error) {
      console.error('Error making user admin:', error);
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-500" />
          Admin einrichten
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email">E-Mail-Adresse</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@beispiel.de"
              className="pl-10"
            />
          </div>
        </div>
        
        <Button 
          onClick={makeUserAdmin}
          disabled={loading || !email}
          className="w-full bg-red-500 hover:bg-red-600"
        >
          <User className="h-4 w-4 mr-2" />
          {loading ? 'Wird verarbeitet...' : 'Zum Administrator machen'}
        </Button>
        
        <p className="text-sm text-gray-600">
          Geben Sie die E-Mail-Adresse eines bereits registrierten Benutzers ein, 
          um ihn zum Administrator zu machen.
        </p>
      </CardContent>
    </Card>
  );
};
