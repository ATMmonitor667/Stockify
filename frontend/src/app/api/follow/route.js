import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId } = await request.json();
    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    // Check if already following
    const { data: existingFollow, error: checkError } = await supabase
      .from('follows')
      .select()
      .eq('follower_id', session.user.id)
      .eq('following_id', targetUserId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking follow status:', checkError);
      return NextResponse.json({ error: 'Failed to check follow status' }, { status: 500 });
    }

    if (existingFollow) {
      // Unfollow
      const { error: unfollowError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', session.user.id)
        .eq('following_id', targetUserId);

      if (unfollowError) {
        console.error('Error unfollowing user:', unfollowError);
        return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 });
      }

      return NextResponse.json({ action: 'unfollowed' });
    } else {
      // Follow
      const { error: followError } = await supabase
        .from('follows')
        .insert([
          {
            follower_id: session.user.id,
            following_id: targetUserId
          }
        ]);

      if (followError) {
        console.error('Error following user:', followError);
        return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
      }

      return NextResponse.json({ action: 'followed' });
    }
  } catch (error) {
    console.error('Error in follow API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get followers count
    const { count: followersCount, error: followersError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (followersError) {
      console.error('Error fetching followers count:', followersError);
      return NextResponse.json({ error: 'Failed to fetch followers count' }, { status: 500 });
    }

    // Get following count
    const { count: followingCount, error: followingError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (followingError) {
      console.error('Error fetching following count:', followingError);
      return NextResponse.json({ error: 'Failed to fetch following count' }, { status: 500 });
    }

    return NextResponse.json({
      followers: followersCount,
      following: followingCount
    });
  } catch (error) {
    console.error('Error in follow API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 